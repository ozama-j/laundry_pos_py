import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (e) {
      alert('Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      }}
    >
      <div
        className="card"
        style={{
          width: '420px',
          padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(33,150,243,0.10)',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#fff'
        }}
      >
        <h2 style={{ marginBottom: 32, color: '#1976d2', fontWeight: 700 }}>Login</h2>
        <input
          style={{ width: '100%', marginBottom: 18, fontSize: '1.1rem' }}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={{ width: '100%', marginBottom: 28, fontSize: '1.1rem' }}
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={{
            width: '60%',
            alignSelf: 'center',
            marginTop: 10,
            fontSize: '1.1rem'
          }}
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}