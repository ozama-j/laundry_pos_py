import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 20 }}>
        <h2>Orders</h2>
        {orders.map(o => (
          <div className ="card" key={o.id}>
            <b>{o.customer}</b> - {o.status} <br />
            Items:
            <ul>
              {o.items.map((i, idx) => <li key={idx}>{i.name} - {i.weight || i.quantity} - Rs.{i.price}</li>)}
            </ul>
            <select onChange={e => updateStatus(o.id, e.target.value)} value={o.status}>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="done">done</option>
              <option value="delivered">delivered</option>
            </select>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
