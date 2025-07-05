import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <button onClick={() => navigate('/orders')}>Manage Orders</button>
      <button onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
      }}>Logout</button>
    </div>
  );
}

export default Dashboard;