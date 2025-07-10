import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import CustomerLookup from '../components/CustomerLookup';
import ItemModal from '../modals/ItemModal';
import api from '../api/axios';
import Logout from '../auth/Logout';
import { FaArrowLeft } from 'react-icons/fa'; // Add this if you have react-icons installed

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);

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

  const submitOrder = async () => {
    if (!customer || cart.length === 0) return alert('Missing customer or cart');
    const items = cart.map(i => ({
      item_id: i.id,
      quantity: i.quantity,
      weight: i.weight
    }));
    await api.post('/orders', {
      customer_id: customer.id,
      items
    });
    alert('Order submitted');
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
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
    </div>
  );
}
