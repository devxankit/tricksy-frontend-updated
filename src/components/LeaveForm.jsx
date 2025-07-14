import React, { useState } from 'react';
import api from '../utils/api';

const LeaveForm = ({ onLeaveApplied }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.post('/leaves/apply', { startDate, endDate, reason });
      setMessage('Leave applied successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      if (onLeaveApplied) onLeaveApplied();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold">Apply for Leave</h2>
      <div>
        <label className="block mb-1">Start Date</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={e => setStartDate(e.target.value)} 
          required 
          className="border p-2 rounded w-full focus:ring-2 focus:border-transparent" 
          style={{ focusRing: '#5C2D91' }}
        />
      </div>
      <div>
        <label className="block mb-1">End Date</label>
        <input 
          type="date" 
          value={endDate} 
          onChange={e => setEndDate(e.target.value)} 
          required 
          className="border p-2 rounded w-full focus:ring-2 focus:border-transparent" 
          style={{ focusRing: '#5C2D91' }}
        />
      </div>
      <div>
        <label className="block mb-1">Reason</label>
        <textarea 
          value={reason} 
          onChange={e => setReason(e.target.value)} 
          required 
          className="border p-2 rounded w-full focus:ring-2 focus:border-transparent" 
          style={{ focusRing: '#5C2D91' }}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading} 
        className="text-white px-4 py-2 rounded hover:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: '#5C2D91' }}
      >
        {loading ? 'Applying...' : 'Apply'}
      </button>
      {message && <div className="text-green-600 mt-2">{message}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
};

export default LeaveForm; 