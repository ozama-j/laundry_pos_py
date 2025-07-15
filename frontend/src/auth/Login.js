import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (e) {
      alert('Login failed: Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      }}
    >
      <div
        className="card"
        style={{
          width: '420px',
          padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(33,150,243,0.15)',
          borderRadius: '10px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2 style={{ marginBottom: 32, color: '#1976d2', fontWeight: 700 }}>Login</h2>
        <input
          style={{
            width: '100%',
            marginBottom: 18,
            fontSize: '1.1rem',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={{
            width: '100%',
            marginBottom: 28,
            fontSize: '1.1rem',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={{
            width: '60%',
            padding: '10px 16px',
            fontSize: '1.1rem',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}
