// /components/Orders.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';
import './styles.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ customer_id: '', items: [] });
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders');
      setOrders(res.data);
    } catch (err) {
      alert('Failed to fetch orders');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      alert('Failed to fetch customers');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get('/items');
      setItems(res.data);
    } catch (err) {
      alert('Failed to fetch items');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete order?')) return;
    try {
      await axios.delete(`/orders/${id}`);
      fetchOrders();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const downloadPDF = (id) => {
    window.open(`http://127.0.0.1:5000/orders/${id}/pdf`, '_blank');
  };

  const emailInvoice = async (id) => {
    const email = prompt('Enter recipient email:');
    if (!email) return;
    try {
      await axios.post(`/orders/${id}/email`, { email });
      alert('Email sent');
    } catch (err) {
      alert('Failed to send email');
    }
  };

  const addOrderItem = () => {
    if (!itemId || quantity <= 0) return;
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { item_id: parseInt(itemId), quantity: parseInt(quantity) }],
    }));
    setItemId('');
    setQuantity(1);
  };

  const createOrder = async () => {
    try {
      await axios.post('/orders', newOrder);
      setNewOrder({ customer_id: '', items: [] });
      fetchOrders();
    } catch (err) {
      alert('Failed to create order');
    }
  };

  return (
    <div className="card">
      <h2>Orders</h2>
      <div className="order-form">
        <h4>Create New Order</h4>
        <select
          value={newOrder.customer_id}
          onChange={(e) => setNewOrder({ ...newOrder, customer_id: e.target.value })}
        >
          <option value="">Select Customer</option>
          {customers.map((cust) => (
            <option key={cust.id} value={cust.id}>{cust.name} ({cust.mobile})</option>
          ))}
        </select>

        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        >
          <option value="">Select Item</option>
          {items.map((itm) => (
            <option key={itm.id} value={itm.id}>{itm.name} - Rs.{itm.price}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button onClick={addOrderItem}>Add Item</button>

        <ul>
          {newOrder.items.map((item, index) => (
            <li key={index}>Item ID: {item.item_id}, Qty: {item.quantity}</li>
          ))}
        </ul>

        <button onClick={createOrder}>Submit Order</button>
      </div>

      <ul>
        {orders.map(order => (
          <li key={order.id}>
            <strong>Order #{order.id}</strong> - Status: {order.status}
            <button onClick={() => navigate(`/invoice/${order.id}`)}>View</button>
            <button onClick={() => downloadPDF(order.id)}>PDF</button>
            <button onClick={() => emailInvoice(order.id)}>Email</button>
            <button onClick={() => deleteOrder(order.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/dashboard')}>Back</button>
    </div>
  );
}

export default Orders;
