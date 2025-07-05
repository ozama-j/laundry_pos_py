import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Invoice from './components/Invoice';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/orders"
        element={<ProtectedRoute><Orders /></ProtectedRoute>}
      />
      <Route
        path="/invoice/:orderId"
        element={<ProtectedRoute><Invoice /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default App;