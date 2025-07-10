import React, { useState } from 'react';
import { Modal } from '@mui/material';
import api from '../api/axios';

export default function AddCustomerModal({ open, handleClose, setCustomer }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleAdd = async () => {
    const res = await api.post('/customers', { name, mobile });
    setCustomer({ id: res.data.customer_id, name, mobile });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div style={{ background: '#fff', padding: 20, margin: '10% auto', width: 300 }}>
        <h3>Add Customer</h3>
        <input placeholder="Name" onChange={e => setName(e.target.value)} /><br />
        <input placeholder="Mobile" onChange={e => setMobile(e.target.value)} /><br />
        <button onClick={handleAdd}>Add</button>
      </div>
    </Modal>
  );
}
