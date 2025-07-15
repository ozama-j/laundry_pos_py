import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div
      className="card"
      style={{
        width: '150px',
        background: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)',
        height: '100vh',
        padding: '2rem 1rem',
        boxShadow: '2px 0 12px rgba(33,150,243,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderTopRightRadius: '18px',
        borderBottomRightRadius: '18px',
        position: 'fixed', // <-- Added to fix the sidebar
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <h2 style={{ color: '#1976d2', marginBottom: '2rem', fontWeight: 700, letterSpacing: 1 }}>Menu</h2>
      <Link
        to="/dashboard"
        style={{
          color: '#1976d2',
          textDecoration: 'none',
          fontSize: '1.1rem',
          margin: '0.5rem 0',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'background 0.2s, color 0.2s',
          display: 'block',
          fontWeight: 500,
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e3f2fd')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
      >
        🏠 Home
      </Link>
      <Link
        to="/orders"
        style={{
          color: '#1976d2',
          textDecoration: 'none',
          fontSize: '1.1rem',
          margin: '0.5rem 0',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'background 0.2s, color 0.2s',
          display: 'block',
          fontWeight: 500,
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e3f2fd')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
      >
        📦 Orders
      </Link>
      <Link
        to="/customers"
        style={{
          color: '#1976d2',
          textDecoration: 'none',
          fontSize: '1.1rem',
          margin: '0.5rem 0',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'background 0.2s, color 0.2s',
          display: 'block',
          fontWeight: 500,
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e3f2fd')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
      >
        👥 Customers
      </Link>
      <Link
        to="/sales"
        style={{
          color: '#1976d2',
          textDecoration: 'none',
          fontSize: '1.1rem',
          margin: '0.5rem 0',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'background 0.2s, color 0.2s',
          display: 'block',
          fontWeight: 500,
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#e3f2fd')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
      >
        📊 Sales
      </Link>
    </div>
  );
}
