import React from 'react';
import api from '../api/axios'; 

export default function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      // Call backend logout API
      await api.post('/logout');
    } catch (err) {
      // Optionally handle error (e.g., show a message)
      console.error('Logout failed:', err);
    } finally {
      // Clear any authentication tokens or user data here
      localStorage.removeItem('authToken');
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}