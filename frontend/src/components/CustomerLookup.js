import React, { useState } from 'react';
import api from '../api/axios';
import AddCustomerModal from '../modals/AddCustomerModal';

export default function CustomerLookup({ setSelectedCustomer }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('mobile'); // 'mobile' or 'name'
  const [customer, setCustomer] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleSearch = async () => {
    try {
      let endpoint = '';

      if (searchType === 'mobile') {
        endpoint = `/customers/by-mobile/${query}`;
      } else {
        endpoint = `/customers/by-name/${query}`;
      }

      const res = await api.get(endpoint);

      const result = searchType === 'name' ? res.data[0] : res.data;
      if (!result) throw new Error('Not found');

      setCustomer(result);
      setSelectedCustomer(result);
    } catch (err) {
      alert('Customer not found');
      setCustomer(null);
    }
  };

  return (
    <div style={{ width: '50%', padding: 20 }}>
      <h3>Customer Lookup</h3>

      <select onChange={(e) => setSearchType(e.target.value)} value={searchType}>
        <option value="mobile">Search by Mobile</option>
        <option value="name">Search by Name</option>
      </select>

      <input
        placeholder={`Enter ${searchType}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} style={{marginRight:'4px'}}>Search</button>
      <button onClick={() => setShowAdd(true)}>Add </button>

      {customer && <div>Selected: {customer.name} ({customer.mobile})</div>}

      <AddCustomerModal
        open={showAdd}
        handleClose={() => setShowAdd(false)}
        setCustomer={(c) => {
          setCustomer(c);
          setSelectedCustomer(c);
        }}
      />
    </div>
  );
}