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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

export default function Sales() {
  const [summary, setSummary] = useState({ total_sales: 0, total_orders: 0, sales_by_date: [] });
  const [byCategory, setByCategory] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  useEffect(() => {
    api.get('/sales/summary').then(res => setSummary(res.data));
    api.get('/sales/by-category').then(res => setByCategory(res.data));
    api.get('/sales/top-customers').then(res => setTopCustomers(res.data));
    api.get('/sales/top-items').then(res => setTopItems(res.data));
    api.get('/sales/monthly-summary').then(res => setMonthly(res.data));
    api.get('/sales/status-breakdown').then(res => {
      const converted = Object.entries(res.data).map(([status, count]) => ({ status, count }));
      setStatusBreakdown(converted);
    });
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">
        <div className="card" style={{ flex: 1, padding: 20 }}>
          <h2>Sales Dashboard</h2>
          <p><strong>Total Income:</strong> Rs. {summary.total_sales}</p>
          <p><strong>Total Orders:</strong> {summary.total_orders}</p>

          <h3>Daily Income</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.sales_by_date}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>

          <h3>Monthly Income</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="total_sales"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <h3>Top Customers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCustomers}>
              <XAxis dataKey="customer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_spent" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Top Items/Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems}>
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
