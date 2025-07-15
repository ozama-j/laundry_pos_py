from flask import Flask, jsonify, request, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime,timedelta
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Table, TableStyle
import smtplib
from flask_cors import CORS
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:0000@localhost/laundry_pos1'
app.config['JWT_SECRET_KEY'] = 'd2e479a6f8b749c4b90afed23f89a72efb362d61ea9d1c3e8e57d44f0c6b8a22'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=9)  # Token expires in 9 hours
db = SQLAlchemy(app)
jwt = JWTManager(app)

# --------------------- MODELS ---------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=True)
    email = db.Column(db.String(100), nullable=True)

class ItemCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('item_category.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    is_weight_based = db.Column(db.Boolean, default=False)
    category = db.relationship('ItemCategory')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    customer = db.relationship('Customer')

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    quantity = db.Column(db.Integer)
    weight = db.Column(db.Float)
    price = db.Column(db.Float)
    order = db.relationship('Order', backref=db.backref('order_items', lazy=True))
    item = db.relationship('Item')

# --------------------- ROLE DECORATOR ---------------------
def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user = get_jwt_identity()
            user = User.query.filter_by(username=current_user).first()
            if user.role != role:
                return jsonify({'msg': f'Access forbidden: {role}s only'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# --------------------- AUTH ROUTES ---------------------
@app.route('/register', methods=['POST'])
@role_required('admin')
def register():
    data = request.get_json()
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=hashed_pw, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'msg': 'User created'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=user.username)
    return jsonify(access_token=access_token), 200

@app.route('/update-password', methods=['POST'])
@role_required('admin')
def update_password():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    user.password = generate_password_hash(data['new_password'])
    db.session.commit()
    return jsonify({'msg': 'Password updated'}), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT tokens are stateless, so we can't "logout" in the traditional sense.
    # However, we can implement token revocation if needed.
    return jsonify({'msg': 'Logged out successfully'}), 200

# --------------------- CUSTOMER MANAGEMENT ---------------------
@app.route('/customers', methods=['POST'])
@jwt_required()
def create_customer():
    data = request.get_json()
    name = data.get('name').strip()
    mobile = data.get('mobile').strip()
    address = data.get('address').strip()
    email = data.get('email').strip()

    if not name or not mobile:
        return jsonify({'msg': 'Missing data'}), 400

    existing_customer = Customer.query.filter_by(mobile=mobile).first()
    if existing_customer:
        return jsonify({'msg': 'Customer already exists'}), 400

    customer = Customer(name=name, mobile=mobile, address=address, email=email)
    db.session.add(customer)
    db.session.commit()
    return jsonify({'msg': 'Customer created', 'customer_id': customer.id}), 201

@app.route('/customers', methods=['GET'])
@jwt_required()
def get_all_customers():
    customers = Customer.query.all()
    results = []
    for customer in customers:
        results.append({
            'id': customer.id,
            'name': customer.name,
            'mobile': customer.mobile,
            'address': customer.address,
            'email': customer.email
        })
    return jsonify(results), 200

@app.route('/customers/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_single_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'mobile': customer.mobile,
        'address': customer.address,
        'email': customer.email
    }), 200 

@app.route('/customers/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    data = request.get_json()
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404

    name = data.get('name')
    mobile = data.get('mobile')
    address = data.get('address')
    email = data.get('email')

    if not name or not mobile:
        return jsonify({'msg': 'Missing data'}), 400

    customer.name = name
    customer.mobile = mobile
    customer.address = address
    customer.email = email
    db.session.commit()
    return jsonify({'msg': 'Customer updated'}), 200

@app.route('/customers/by-mobile/<string:mobile>', methods=['PUT'])
@jwt_required()
def update_customer_by_mobile(mobile):
    data = request.get_json()
    customer = Customer.query.filter_by(mobile=mobile).first()
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404

    name = data.get('name')
    new_mobile = data.get('mobile')
    address = data.get('address')
    email = data.get('email')

    if not name or not new_mobile:
        return jsonify({'msg': 'Missing data'}), 400

    customer.name = name
    customer.mobile = new_mobile
    customer.address = address
    customer.email = email
    db.session.commit()
    return jsonify({'msg': 'Customer updated'}), 200


@app.route('/customers/<int:customer_id>', methods=['DELETE'])
@role_required('admin')
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'msg': f'Customer #{customer.id} deleted successfully'}), 200

@app.route('/customers/by-mobile/<string:mobile>', methods=['DELETE'])
@role_required('admin')
def delete_customer_by_mobile(mobile):
    customer = Customer.query.filter_by(mobile=mobile).first()
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404
    db.session.delete(customer)
    db.session.commit()
    return jsonify({'msg': f'Customer with mobile {mobile} deleted successfully'}), 200



@app.route('/customers/by-mobile/<string:mobile>', methods=['GET'])
@jwt_required()
def get_customer_by_mobile(mobile):
    customer = Customer.query.filter_by(mobile=mobile).first()
    if not customer:
        return jsonify({'msg': 'Customer not found'}), 404
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'mobile': customer.mobile,
        'address': customer.address,
        'email': customer.email
    }), 200

@app.route('/customers/by-name/<string:name>', methods=['GET'])
@jwt_required()
def get_customer_by_name(name):
    customers = Customer.query.filter(Customer.name.ilike(f'%{name}%')).all()
    if not customers:
        return jsonify({'msg': 'No customers found'}), 404
    results = []
    for customer in customers:
        results.append({
            'id': customer.id,
            'name': customer.name,
            'mobile': customer.mobile,
            'address': customer.address,
            'email': customer.email
        })
    return jsonify(results), 200

# --------------------- ITEM MANAGEMENT ---------------------

@app.route('/items', methods=['POST'])
@role_required('admin')
def create_item():
    data = request.get_json()
    name = data.get('name')
    category_id = data.get('category_id')
    price = data.get('price')
    is_weight_based = data.get('is_weight_based', False)

    if not name or not category_id or price is None:
        return jsonify({'msg': 'Missing data'}), 400

    item = Item(name=name, category_id=category_id, price=price, is_weight_based=is_weight_based)
    db.session.add(item)
    db.session.commit()
    return jsonify({'msg': 'Item created', 'item_id': item.id}), 201

@app.route('/items', methods=['GET'])
@jwt_required()
def get_all_items():
    items = Item.query.all()
    results = []
    for item in items:
        results.append({
            'id': item.id,
            'name': item.name,
            'category': item.category.name if item.category else None,
            'price': item.price,
            'is_weight_based': item.is_weight_based
        })
    return jsonify(results), 200

@app.route('/items/<int:item_id>', methods=['GET'])
@jwt_required()
def get_single_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'msg': 'Item not found'}), 404
    return jsonify({
        'id': item.id,
        'name': item.name,
        'category': item.category.name if item.category else None,
        'price': item.price,
        'is_weight_based': item.is_weight_based
    }), 200

@app.route('/items/<int:item_id>', methods=['PUT'])
@role_required('admin')
def update_item(item_id):
    data = request.get_json()
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'msg': 'Item not found'}), 404

    name = data.get('name')
    category_id = data.get('category_id')
    price = data.get('price')
    is_weight_based = data.get('is_weight_based', False)
    if not name or not category_id or price is None:
        return jsonify({'msg': 'Missing data'}), 400
    item.name = name
    item.category_id = category_id
    item.price = price
    item.is_weight_based = is_weight_based  
    db.session.commit()
    return jsonify({'msg': 'Item updated'}), 200

@app.route('/items/<int:item_id>', methods=['DELETE'])
@role_required('admin')
def delete_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'msg': 'Item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'msg': f'Item #{item.id} deleted successfully'}), 200

# --------------------- ITEM CATEGORY MANAGEMENT ---------------------
@app.route('/item-categories', methods=['POST'])
@role_required('admin') 
def create_item_category():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'msg': 'Missing data'}), 400

    category = ItemCategory(name=name)
    db.session.add(category)
    db.session.commit()
    return jsonify({'msg': 'Item category created', 'category_id': category.id}), 201

@app.route('/item-categories', methods=['GET'])
@jwt_required()
def get_all_item_categories():
    categories = ItemCategory.query.all()
    results = []
    for category in categories:
        results.append({
            'id': category.id,
            'name': category.name
        })
    return jsonify(results), 200

@app.route('/item-categories/<int:category_id>', methods=['GET'])
@jwt_required()
def get_single_item_category(category_id):
    category = ItemCategory.query.get(category_id)
    if not category:
        return jsonify({'msg': 'Item category not found'}), 404
    return jsonify({
        'id': category.id,
        'name': category.name
    }), 200

@app.route('/item-categories/<int:category_id>', methods=['PUT'])
@role_required('admin')
def update_item_category(category_id):
    data = request.get_json()
    category = ItemCategory.query.get(category_id)
    if not category:
        return jsonify({'msg': 'Item category not found'}), 404

    name = data.get('name')
    if not name:
        return jsonify({'msg': 'Missing data'}), 400

    category.name = name
    db.session.commit()
    return jsonify({'msg': 'Item category updated'}), 200

@app.route('/item-categories/<int:category_id>', methods=['DELETE'])
@role_required('admin')
def delete_item_category(category_id):  
    category = ItemCategory.query.get(category_id)
    if not category:
        return jsonify({'msg': 'Item category not found'}), 404
    db.session.delete(category)
    db.session.commit()
    return jsonify({'msg': f'Item category #{category.id} deleted successfully'}), 200

@app.route('/item-categories/<string:category_name>/items', methods=['GET'])
@jwt_required() 
def get_items_by_category_name(category_name):
    category = ItemCategory.query.filter_by(name=category_name).first()
    if not category:
        return jsonify({'msg': 'Item category not found'}), 404
    items = Item.query.filter_by(category_id=category.id).all()
    results = []
    for item in items:
        results.append({
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'is_weight_based': item.is_weight_based
        })
    return jsonify(results), 200

@app.route('/item-categories/<int:category_id>/items', methods=['GET'])
@jwt_required()
def get_items_by_category_id(category_id):
    category = ItemCategory.query.get(category_id)
    if not category:
        return jsonify({'msg': 'Item category not found'}), 404
    items = Item.query.filter_by(category_id=category.id).all()
    results = []
    for item in items:
        results.append({
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'is_weight_based': item.is_weight_based
        })
    return jsonify(results), 200


# --------------------- ORDER MANAGEMENT ---------------------

@app.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    customer_id = data.get('customer_id')
    items = data.get('items', [])

    if not customer_id or not items:
        return jsonify({'msg': 'Missing data'}), 400

    order = Order(customer_id=customer_id)
    db.session.add(order)
    db.session.flush()

    for entry in items:
        item_id = entry['item_id']
        item = Item.query.get(item_id)
        if not item:
            continue

        if item.is_weight_based:
            weight = float(entry['weight'])
            price = item.price
            if weight > 1:
                price += (weight - 1) * 200
            order_item = OrderItem(order_id=order.id, item_id=item.id, weight=weight, price=price)
        else:
            quantity = int(entry['quantity'])
            price = quantity * item.price
            order_item = OrderItem(order_id=order.id, item_id=item.id, quantity=quantity, price=price)

        db.session.add(order_item)

    db.session.commit()
    return jsonify({'msg': 'Order created', 'order_id': order.id}), 201

@app.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    orders = Order.query.all()
    results = []
    for order in orders:
        order_data = {
            'id': order.id,
            'customer': order.customer.name,
            'status': order.status,
            'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'items': []
        }
        for item in order.order_items:
            item_data = {
                'name': item.item.name,
                'quantity': item.quantity,
                'weight': item.weight,
                'price': item.price
            }
            order_data['items'].append(item_data)
        results.append(order_data)
    return jsonify(results), 200

@app.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_single_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404

    items = []
    for item in order.order_items:
        items.append({
            'name': item.item.name,
            'quantity': item.quantity,
            'weight': item.weight,
            'price': item.price
        })

    return jsonify({
        'id': order.id,
        'customer': order.customer.name,
        'status': order.status,
        'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'items': items
    }), 200

@app.route('/orders/customer/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_orders_by_customer(customer_id):
    orders = Order.query.filter_by(customer_id=customer_id).all()
    results = []
    for order in orders:
        order_data = {
            'id': order.id,
            'status': order.status,
            'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'items': []
        }
        for item in order.order_items:
            item_data = {
                'name': item.item.name,
                'quantity': item.quantity,
                'weight': item.weight,
                'price': item.price
            }
            order_data['items'].append(item_data)
        results.append(order_data)
    return jsonify(results), 200

@app.route('/orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    data = request.get_json()
    status = data.get('status')
    if not status:
        return jsonify({'msg': 'Missing status'}), 400
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404
    order.status = status
    db.session.commit()
    return jsonify({'msg': f'Order #{order.id} status updated to {status}'}), 200

@app.route('/orders/<int:order_id>', methods=['DELETE'])
@role_required('admin')
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404
    db.session.delete(order)
    db.session.commit()
    return jsonify({'msg': f'Order #{order.id} deleted successfully'}), 200


@app.route('/orders/<int:order_id>/pdf', methods=['GET'])
@jwt_required()
def generate_invoice(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404

    pdf = BytesIO()
    c = canvas.Canvas(pdf, pagesize=A4)
    width, height = A4

    # Header
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(colors.HexColor("#1976d2"))
    c.drawCentredString(width / 2, height - 40, "Kleen Laundry")
    c.setFont("Helvetica", 13)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 65, f"Invoice for Order #{order.id}")

    # Customer Info
    c.setFont("Helvetica", 11)
    c.drawString(40, height - 100, f"Customer: {order.customer.name} ({order.customer.mobile})")
    if order.customer.email:
        c.drawString(40, height - 115, f"Email: {order.customer.email}")
    if order.customer.address:
        c.drawString(40, height - 130, f"Address: {order.customer.address}")

    # Table Data
    data = [["Item", "Qty/Wt", "Price (Lkr)"]]
    total = 0
    for item in order.order_items:
        qty = f"{item.weight}kg" if item.weight else f"{item.quantity}pcs"
        data.append([item.item.name, qty, f"{item.price:.2f}"])
        total += item.price

    # Table
    table = Table(data, colWidths=[200, 80, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e3f2fd")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#1976d2")),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#bbdefb")),
    ]))
    table.wrapOn(c, width, height)
    table.drawOn(c, 40, height - 180 - 24 * len(data))

    # Total
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(colors.HexColor("#1976d2"))
    c.drawString(40, height - 200 - 24 * len(data), f"Total: Lkr. {total:.2f}")

    c.save()
    pdf.seek(0)
    return send_file(pdf, download_name=f"invoice_order_{order.id}.pdf", as_attachment=True)

@app.route('/orders/<int:order_id>/email', methods=['POST'])
@role_required('admin')
def email_invoice(order_id):
    data = request.get_json()
    recipient_email = data['email']
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'msg': 'Order not found'}), 404
    pdf = BytesIO()
    c = canvas.Canvas(pdf)
    c.drawString(100, 800, f"Invoice for Order #{order.id}")
    y = 750
    total = 0
    for item in order.order_items:
        if item.weight:
            line = f"{item.item.name} - {item.weight}kg = Rs. {item.price:.2f}"
        else:
            line = f"{item.item.name} x {item.quantity} = Rs. {item.price:.2f}"
        c.drawString(100, y, line)
        y -= 20
        total += item.price
    c.drawString(100, y - 20, f"Total: Rs. {total:.2f}")
    c.save()
    pdf.seek(0)

    msg = MIMEMultipart()
    msg['From'] = 'your_email@example.com'
    msg['To'] = recipient_email
    msg['Subject'] = f"Invoice for Order #{order.id}"
    msg.attach(MIMEText("Please find attached invoice.", 'plain'))

    attachment = MIMEApplication(pdf.read(), _subtype="pdf")
    attachment.add_header('Content-Disposition', 'attachment', filename=f"invoice_order_{order.id}.pdf")
    msg.attach(attachment)

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login('your_email@example.com', 'your_password')
        server.send_message(msg)
        server.quit()
        return jsonify({'msg': 'Invoice emailed successfully'}), 200
    except Exception as e:
        return jsonify({'msg': f'Email failed: {str(e)}'}), 500
    
# --------------------- SALES SUMMARY   ---------------------
@app.route('/sales/summary', methods=['GET'])
@jwt_required()
def get_sales_summary():
    orders = Order.query.filter(Order.status == 'delivered').all()
    total_sales = 0
    total_orders = len(orders)
    sales_by_date = {}

    for order in orders:
        order_date = order.created_at.date()
        if order_date not in sales_by_date:
            sales_by_date[order_date] = 0
        for item in order.order_items:
            sales_by_date[order_date] += item.price
            total_sales += item.price

    # Convert sales_by_date into a list of dicts for frontend charting
    sales_by_date_list = [
        {"date": str(date), "total": total}
        for date, total in sorted(sales_by_date.items())
    ]

    summary = {
        'total_sales': total_sales,
        'total_orders': total_orders,
        'sales_by_date': sales_by_date_list  # For charting
    }
    return jsonify(summary), 200

@app.route('/sales/by-category', methods=['GET'])
@jwt_required()
def sales_by_category():
    categories = ItemCategory.query.all()
    result = []

    for category in categories:
        total = 0
        items = Item.query.filter_by(category_id=category.id).all()
        item_ids = [item.id for item in items]
        order_items = OrderItem.query.filter(OrderItem.item_id.in_(item_ids)).all()
        for item in order_items:
            total += item.price
        result.append({
            'category': category.name,
            'total_sales': total
        })

    return jsonify(result), 200

@app.route('/sales/top-customers', methods=['GET'])
@jwt_required()
def top_customers():
    customer_spending = {}

    orders = Order.query.filter(Order.status == 'delivered').all()
    for order in orders:
        total = sum(item.price for item in order.order_items)
        if order.customer.name not in customer_spending:
            customer_spending[order.customer.name] = total
        else:
            customer_spending[order.customer.name] += total

    sorted_customers = sorted(customer_spending.items(), key=lambda x: x[1], reverse=True)
    result = [{'customer': name, 'total_spent': spent} for name, spent in sorted_customers[:10]]
    return jsonify(result), 200

@app.route('/sales/top-items', methods=['GET'])
@jwt_required()
def top_items():
    item_counts = {}
    items = Item.query.all()

    for item in items:
        order_items = OrderItem.query.filter_by(item_id=item.id).all()
        count = sum([oi.quantity or oi.weight or 0 for oi in order_items])
        item_counts[item.name] = count

    sorted_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)
    result = [{'item': name, 'count': count} for name, count in sorted_items[:10]]
    return jsonify(result), 200

@app.route('/sales/monthly-summary', methods=['GET'])
@jwt_required()
def monthly_summary():
    from collections import defaultdict
    import calendar

    monthly_data = defaultdict(float)
    orders = Order.query.filter(Order.status == 'delivered').all()

    for order in orders:
        month_key = order.created_at.strftime('%Y-%m')
        for item in order.order_items:
            monthly_data[month_key] += item.price

    result = [{"month": month, "total_sales": total} for month, total in sorted(monthly_data.items())]
    return jsonify(result), 200

@app.route('/sales/orders-per-day', methods=['GET'])
@jwt_required()
def orders_per_day():
    from collections import defaultdict

    daily_orders = defaultdict(int)
    orders = Order.query.all()

    for order in orders:
        date_key = order.created_at.strftime('%Y-%m-%d')
        daily_orders[date_key] += 1

    result = [{"date": date, "orders": count} for date, count in sorted(daily_orders.items())]
    return jsonify(result), 200

@app.route('/sales/status-breakdown', methods=['GET'])
@jwt_required()
def order_status_breakdown():
    from collections import Counter

    orders = Order.query.all()
    status_counts = Counter([order.status for order in orders])
    return jsonify(status_counts), 200


# --------------------- RUN ---------------------
if __name__ == '__main__':
    app.run(debug=True)
