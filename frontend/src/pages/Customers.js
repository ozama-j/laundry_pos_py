import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, padding: 20, marginLeft: '180px' }}>
        <h2>Customers</h2>
        <ul>
          {customers.map(c => <li key={c.id}>{c.name} - {c.mobile}</li>)}
        </ul>
      </div>
    </div>
  );
}