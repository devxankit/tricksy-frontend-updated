import api from '../utils/api';

// Auth service using axios
export const authService = {
  // Login for any role (admin, user, driver)
  login: async (role, credentials) => {
    try {
      const response = await api.post(`/${role}/login`, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register user (admin only)
  registerUser: async (userData) => {
    try {
      const response = await api.post('/admin/register-user', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register driver (admin only)
  registerDriver: async (driverData) => {
    try {
      const response = await api.post('/admin/register-driver', driverData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/all-users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all drivers (admin only)
  getAllDrivers: async () => {
    try {
      const response = await api.get('/admin/all-drivers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}; 