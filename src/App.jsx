import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import UserPanel from './pages/UserPanel';
import DriverPanel from './pages/DriverPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminUsers, AdminAddUser, AdminDrivers, AdminAssignRoutes, AdminAttendance, AdminProcessLeave } from './pages/AdminPlaceholders';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver" 
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/add" element={<AdminAddUser />} />
          <Route path="/admin/drivers" element={<AdminDrivers />} />
          <Route path="/admin/drivers/assign" element={<AdminAssignRoutes />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/attendance/leave" element={<AdminProcessLeave />} />
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
