import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import api from '../api/axios';

export default function ItemModal({ open, category, onClose, onAdd }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open && category) {
      api.get(`/item-categories/${category}/items`).then(res => setItems(res.data));
    }
  }, [open, category]);

  const handleAdd = (item) => {
    const quantity = item.is_weight_based ? null : parseInt(prompt('Quantity?'), 10);
    const weight = item.is_weight_based ? parseFloat(prompt('Weight in KG?')) : null;
    const price = item.is_weight_based
      ? item.price + ((weight - 1 > 0) ? (weight - 1) * 200 : 0)
      : item.price * quantity;
    onAdd([{ ...item, quantity, weight, price }]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ background: '#fff', padding: 20, margin: '10% auto', width: 400 }}>
        <h3>{category} Items</h3>
        <ul>
          {items.map(i => (
            <li key={i.id}>
              {i.name} - Rs.{i.price} <button onClick={() => handleAdd(i)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}