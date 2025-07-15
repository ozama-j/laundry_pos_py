import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import api from '../api/axios';

export default function ItemModal({ open, category, onClose, onAdd }) {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (open && category) {
      api.get(`/item-categories/${category}/items`).then(res => {
        setItems(res.data);
        // Reset quantities when modal opens
        const initial = {};
        res.data.forEach(item => {
          initial[item.id] = item.is_weight_based ? 1 : 1;
        });
        setQuantities(initial);
      });
    }
  }, [open, category]);

  const handleChange = (item, delta) => {
    setQuantities(prev => {
      const current = prev[item.id] || 1;
      let next;
      if (item.is_weight_based) {
        next = Math.max(0.5, parseFloat((current + delta).toFixed(1)));
      } else {
        next = Math.max(1, current + delta);
      }
      return { ...prev, [item.id]: next };
    });
  };

  const handleAdd = (item) => {
    const quantity = item.is_weight_based ? null : quantities[item.id];
    const weight = item.is_weight_based ? quantities[item.id] : null;
    const price = item.is_weight_based
      ? item.price + ((weight - 1 > 0) ? (weight - 1) * 200 : 0)
      : item.price * quantity;
    onAdd([{ ...item, quantity, weight, price }]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          background: '#fff',
          padding: 20,
          margin: '10% auto',
          width: 400,
          maxHeight: '70vh',
          overflowY: 'auto',
          borderRadius: 12,
        }}
      >
        <h3>{category} Items</h3>
        <ul>
          {items.map(i => (
            <li key={i.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ flex: 1 }}>{i.name} - Rs.{i.price}</span>
              <button onClick={() => handleChange(i, -1)} style={{ margin: '0 6px' }}>-</button>
              <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                {quantities[i.id]}
              </span>
              <button onClick={() => handleChange(i, 1)} style={{ margin: '0 6px' }}>+</button>
              <button onClick={() => handleAdd(i)} style={{ marginLeft: 10 }}>Add</button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}