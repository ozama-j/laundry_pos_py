import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Sales() {
  const [data, setData] = useState({
    total_sales: 0,
    total_orders: 0,
    sales_by_date: [],
  });

  useEffect(() => {
    api.get('/sales/summary').then(res => setData(res.data));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="card" style={{ flex: 1, padding: 20 }}>
        <h2>Sales Dashboard</h2>
        <p><strong>Total Income:</strong> Rs. {data.total_sales}</p>
        <p><strong>Total Orders:</strong> {data.total_orders}</p>

        <h3>Daily Income</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.sales_by_date}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
