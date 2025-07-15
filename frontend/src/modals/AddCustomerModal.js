import React, { useState } from 'react';
import { Modal } from '@mui/material';
import api from '../api/axios';

export default function AddCustomerModal({ open, handleClose, setCustomer }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const isValidMobile = mobile => /^0\d{9}$/.test(mobile);
  const canSubmit = name.trim() !== '' && isValidMobile(mobile);

  const handleAdd = async () => {
    if (!canSubmit) return; // extra safety
    const res = await api.post('/customers', { name, mobile, address, email });
    setCustomer({
      id: res.data.customer_id,
      name,
      mobile,
      address,
      email
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div style={{ background: '#fff', padding: 20, margin: '10% auto', width: 300 }}>
        <h3>Add Customer</h3>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /><br />
        <input placeholder="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} /><br />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} /><br />
        <button 
          onClick={handleAdd} 
          disabled={!canSubmit} 
          style={{
            opacity: canSubmit ? 1 : 0.5,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
        >
          Add
        </button>
      </div>
    </Modal>
  );
}
