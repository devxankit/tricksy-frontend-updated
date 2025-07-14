import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (token && user && role) {
      // User is already logged in, redirect to appropriate panel
      navigate(`/${role}`, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole || !form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/${selectedRole}/login`, form);
      const data = response.data;

      // Store token and user data
      if (selectedRole === 'driver') {
        localStorage.setItem('user', JSON.stringify(data.driver));
      } else if (selectedRole === 'admin') {
        localStorage.setItem('user', JSON.stringify(data.admin));
      } else if (selectedRole === 'user') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('role', selectedRole);
      localStorage.setItem('token', data.token);
      
      // Navigate based on role
      navigate(`/${selectedRole}`, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
        
        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {['admin', 'user', 'driver'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`p-2 sm:p-3 rounded-md border text-sm sm:text-base transition-colors ${
                  selectedRole === role
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: selectedRole === role ? '#5C2D91' : undefined }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm sm:text-base"
            style={{ focusRing: '#5C2D91' }}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm sm:text-base"
            style={{ focusRing: '#5C2D91' }}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          <button 
            className="w-full text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium" 
            style={{ backgroundColor: '#5C2D91' }}
            type="submit"
            disabled={loading || !selectedRole}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 