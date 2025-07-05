import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/api';
import '../index.css';

function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get(`/orders`).then(res => {
      const found = res.data.find(o => o.id === parseInt(orderId));
      if (found) setOrder(found);
    });
  }, [orderId]);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>Invoice for Order #{order.id}</h2>
      <ul>
        {order.order_items?.map((item) => (
          <li key={item.id}>{item.item.name} x {item.quantity}</li>
        ))}
      </ul>
    </div>
  );
}

export default Invoice;