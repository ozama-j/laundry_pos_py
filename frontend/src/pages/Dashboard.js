import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import CustomerLookup from '../components/CustomerLookup';
import ItemModal from '../modals/ItemModal';
import api from '../api/axios';
import Logout from '../auth/Logout';
import { FaArrowLeft } from 'react-icons/fa';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    api.get('/item-categories').then(res => setServices(res.data));
  }, []);

  const openModal = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const addToCart = (items) => {
    setCart([...cart, ...items]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handlePrintPDF = async () => {
    if (!orderId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/orders/${orderId}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to print PDF');
    }
  };

  const submitOrder = async () => {
    if (!customer || cart.length === 0) return alert('Missing customer or cart');
    try {
      const items = cart.map(i => ({
        item_id: i.id,
        quantity: i.quantity,
        weight: i.weight
      }));
      const res = await api.post('/orders', {
        customer_id: customer.id,
        items
      });
      const newOrderId = res.data.order_id;
      setOrderId(newOrderId);

      // Fetch order details for summary
      const summaryRes = await api.get(`/orders/${newOrderId}`);
      setOrderSummary(summaryRes.data);
      setShowSummary(true);
      setCart([]);
    } catch (e) {
      alert('Order submission failed');
    }
  };

  // Cart component to show after customer is selected
  const Cart = () => (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={() => setCustomer(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976d2',
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginRight: 8,
            padding: 0,
          }}
          title="Change customer"
        >
          <FaArrowLeft />
        </button>
        <span style={{ fontWeight: 600, color: '#1976d2' }}>
          {customer.name} ({customer.mobile})
        </span>
      </div>
      <h3>Cart</h3>
      <ul>
        {cart.map((item, i) => (
          <li key={i}>
            {item.name} - {item.weight ? item.weight + 'kg' : item.quantity + 'pcs'} - Rs.{item.price}
          </li>
        ))}
      </ul>
      <button onClick={submitOrder}>Place Order</button>
    </div>
  );

  // Order Summary Modal
  const OrderSummaryModal = () => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(33, 150, 243, 0.13)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(33,150,243,0.18)',
        padding: '36px 32px',
        minWidth: 400,
        maxWidth: 480,
        textAlign: 'center',
        position: 'relative'
      }}>
        <h2 style={{ color: '#1976d2', marginBottom: 8, fontWeight: 800, letterSpacing: 2 }}>Kleen</h2>
        <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 18, fontSize: 18 }}>
          Order Summary
        </div>
        {orderSummary && (
          <>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              <span style={{ color: '#1976d2' }}>Order ID:</span> {orderSummary.id}
            </div>
            <div style={{ marginBottom: 16, fontWeight: 500 }}>
              <span style={{ color: '#1976d2' }}>Customer:</span> {orderSummary.customer}
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 18 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e3f2fd' }}>
                    <th style={{ padding: 8, borderRadius: 6, fontWeight: 600 }}>Item</th>
                    <th style={{ padding: 8, fontWeight: 600 }}>Qty/Wt</th>
                    <th style={{ padding: 8, fontWeight: 600 }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderSummary.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e3f2fd' }}>
                      <td style={{ padding: 8 }}>{item.name}</td>
                      <td style={{ padding: 8 }}>{item.weight ? item.weight + 'kg' : item.quantity + 'pcs'}</td>
                      <td style={{ padding: 8 }}>Lkr.{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>
              Total: Lkr{orderSummary.items.reduce((sum, item) => sum + Number(item.price), 0)}
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={handlePrintPDF} style={{ minWidth: 110 }}>Print</button>
          <button onClick={() => setShowSummary(false)} style={{ minWidth: 110, background: '#fff', color: '#1976d2', border: '1.5px solid #1976d2' }}>Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="card" style={{ flex: 1, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Logout onLogout={handleLogout} />
        </div>
        <h2>Services</h2>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {services.map((s, i) => (
            <button key={i} onClick={() => openModal(s)}>{s.name}</button>
          ))}
        </div>
      </div>
      <div style={{ width: 350, marginLeft: 20 }}>
        {!customer ? (
          <CustomerLookup setSelectedCustomer={setCustomer} />
        ) : (
          <Cart />
        )}
      </div>
      <ItemModal open={modalOpen} category={selectedService?.name} onClose={() => setModalOpen(false)} onAdd={addToCart} />
      {showSummary && <OrderSummaryModal />}
    </div>
  );
}
