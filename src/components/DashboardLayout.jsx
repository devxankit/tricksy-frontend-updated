import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Car, 
  Activity,
  LogOut,
  Menu,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserList from './UserList';
import UserForm from './UserForm';
import DriverList from './DriverList';
import DriverAssignmentForm from './DriverAssignmentForm';
import AttendanceList from './AttendanceList';
import LeaveList from './LeaveList';
import api from '../utils/api';

const DashboardLayout = ({ children, user, onLogout }) => {

  const [openSection, setOpenSection] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchDrivers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/all-users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    const userName = user ? user.name : 'this user';
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/admin/user/${userId}`);
      setMessage(`User "${userName}" deleted successfully!`);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/all-drivers');
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    const driver = drivers.find(d => d._id === driverId);
    const driverName = driver ? driver.name : 'this driver';
    if (!window.confirm(`Are you sure you want to delete ${driverName}? This action cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/admin/driver/${driverId}`);
      setMessage(`Driver "${driverName}" deleted successfully!`);
      fetchDrivers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
              <header className="border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || 'Admin'}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setOpenSection(openSection === 'users' ? null : 'users')}>View All Users</Button>
                <Button className="w-full" onClick={() => setOpenSection(openSection === 'addUser' ? null : 'addUser')}>Add New User</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Driver Management
              </CardTitle>
              <CardDescription>
                Track drivers and manage assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setOpenSection(openSection === 'drivers' ? null : 'drivers')}>View Drivers</Button>
                <Button className="w-full" onClick={() => setOpenSection(openSection === 'assignRoutes' ? null : 'assignRoutes')}>Assign Routes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Attendance
              </CardTitle>
              <CardDescription>
                Monitor attendance and leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setOpenSection(openSection === 'attendance' ? null : 'attendance')}>View Attendance</Button>
                <Button className="w-full" onClick={() => setOpenSection(openSection === 'leave' ? null : 'leave')}>Process Leave</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New driver assigned", time: "2 minutes ago", status: "success" },
                { action: "Leave request approved", time: "5 minutes ago", status: "info" },
                { action: "User login detected", time: "10 minutes ago", status: "warning" },
                { action: "Route updated", time: "15 minutes ago", status: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="mt-8">
          {openSection === 'users' && <UserList users={users} onDeleteUser={handleDeleteUser} />}
          {openSection === 'addUser' && <UserForm />}
          {openSection === 'drivers' && <DriverList drivers={drivers} onDeleteDriver={handleDeleteDriver} />}
          {openSection === 'assignRoutes' && <DriverAssignmentForm />}
          {openSection === 'attendance' && <AttendanceList />}
          {openSection === 'leave' && <LeaveList />}
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 