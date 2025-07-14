import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo, accept any email/password, role
    if (!form.email || !form.password) {
      setError('Email and password required');
      return;
    }
    navigate(form.role === 'admin' ? '/admin' : '/user', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-3 py-2 border rounded"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border rounded"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select
            className="w-full px-3 py-2 border rounded"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Login</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
} 