import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const user = localStorage.getItem('user');

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate panel based on role
    switch (role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'driver':
        return <Navigate to="/driver" replace />;
      case 'user':
        return <Navigate to="/user" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
} 