import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import UserForm from '../components/UserForm';
import DriverForm from '../components/DriverForm';
import UserList from '../components/UserList';
import DriverList from '../components/DriverList';
import AccommodationList from '../components/AccommodationList';
import AttendanceList from '../components/AttendanceList';
import LeaveList from '../components/LeaveList';
import DriverAssignmentForm from '../components/DriverAssignmentForm';
import DriverAssignmentList from '../components/DriverAssignmentList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  Car, 
  Building, 
  Calendar, 
  FileText, 
  MapPin, 
  Plus,
  Trash2,
  Edit,
  Eye,
  Activity
} from 'lucide-react';
import api from '../utils/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [driverAssignments, setDriverAssignments] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', address: '', phone: '', email: '', password: '' });
  const [driverForm, setDriverForm] = useState({ name: '', address: '', phone: '', email: '', password: '', busNumber: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  // Fetch users and drivers on component mount
  useEffect(() => {
    fetchUsers();
    fetchDrivers();
    fetchAccommodations();
    fetchAttendance();
    fetchDriverAssignments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/all-users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchAccommodations = async () => {
    try {
      const response = await api.get('/accommodation/admin/all');
      setAccommodations(response.data.accommodations);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/admin/all');
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchDriverAssignments = async () => {
    try {
      const response = await api.get('/driver-assignment/all');
      setDriverAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching driver assignments:', error);
    }
  };

  const handleUserChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });
  const handleDriverChange = (e) => setDriverForm({ ...driverForm, [e.target.name]: e.target.value });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/admin/register-user', userForm);
      setMessage('User registered successfully!');
      setUserForm({ name: '', address: '', phone: '', email: '', password: '' });
      setShowUserForm(false);
      fetchUsers(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/admin/register-driver', driverForm);
      setMessage('Driver registered successfully!');
      setDriverForm({ name: '', address: '', phone: '', email: '', password: '', busNumber: '' });
      setShowDriverForm(false);
      fetchDrivers(); 
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to register driver');
    } finally {
      setLoading(false);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Drivers",
      value: drivers.length,
      icon: Car,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Accommodations",
      value: accommodations.length,
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Active Assignments",
      value: driverAssignments.length,
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage system users and their permissions</p>
              </div>
              <Button onClick={() => setShowUserForm(!showUserForm)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>

            {showUserForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Add New User
                  </CardTitle>
                  <CardDescription>Create a new user account</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserForm 
                    formData={userForm}
                    onChange={handleUserChange}
                    onSubmit={handleUserSubmit}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users ({users.length})
                </CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <UserList users={users} onDeleteUser={handleDeleteUser} />
              </CardContent>
            </Card>
          </div>
        );
      case 'drivers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
                <p className="text-gray-600">Manage drivers and their assignments</p>
              </div>
              <Button onClick={() => setShowDriverForm(!showDriverForm)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Driver
              </Button>
            </div>

            {showDriverForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Add New Driver
                  </CardTitle>
                  <CardDescription>Create a new driver account</CardDescription>
                </CardHeader>
                <CardContent>
                  <DriverForm 
                    formData={driverForm}
                    onChange={handleDriverChange}
                    onSubmit={handleDriverSubmit}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  All Drivers ({drivers.length})
                </CardTitle>
                <CardDescription>View and manage all registered drivers</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverList drivers={drivers} onDeleteDriver={handleDeleteDriver} />
              </CardContent>
            </Card>
          </div>
        );
              case 'accommodations':
          return (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Accommodation Requests</h2>
                <p className="text-gray-600">Review and manage accommodation requests</p>
              </div>
              <AccommodationList 
                accommodations={accommodations} 
                isAdmin={true} 
                onUpdateStatus={fetchAccommodations}
              />
            </div>
          );
      case 'attendance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
              <p className="text-gray-600">Monitor attendance and track records</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
                <CardDescription>View and manage attendance data</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceList isAdmin={true} />
              </CardContent>
            </Card>
          </div>
        );
      case 'leaves':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
              <p className="text-gray-600">Process and manage leave requests</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Requests
                </CardTitle>
                <CardDescription>Review and approve leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveList role="admin" />
              </CardContent>
            </Card>
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Driver Assignments</h2>
              <p className="text-gray-600">Manage driver routes and assignments</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Assignments
                </CardTitle>
                <CardDescription>Assign drivers to routes and manage schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <DriverAssignmentForm />
                <DriverAssignmentList assignments={driverAssignments} />
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">{users.length} users registered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('drivers')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-full">
                      <Car className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Driver Management</h3>
                      <p className="text-sm text-gray-600">{drivers.length} drivers active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('accommodations')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-full">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Accommodations</h3>
                      <p className="text-sm text-gray-600">{accommodations.length} requests pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('attendance')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 rounded-full">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Attendance</h3>
                      <p className="text-sm text-gray-600">Monitor daily attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('leaves')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <Calendar className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Leave Requests</h3>
                      <p className="text-sm text-gray-600">Process leave applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('assignments')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-full">
                      <MapPin className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Assignments</h3>
                      <p className="text-sm text-gray-600">{driverAssignments.length} active routes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "New user registered", time: "2 minutes ago", status: "success", icon: Users },
                    { action: "Driver assignment updated", time: "5 minutes ago", status: "info", icon: Car },
                    { action: "Accommodation request approved", time: "10 minutes ago", status: "success", icon: Building },
                    { action: "Leave request submitted", time: "15 minutes ago", status: "warning", icon: Calendar }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-full">
                          <activity.icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Message Display */}
        {message && (
          <Card className={message.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="pt-6">
              <p className={message.includes('successfully') ? 'text-green-800' : 'text-red-800'}>
                {message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'users', label: `Users (${users.length})`, icon: Users },
                { id: 'drivers', label: `Drivers (${drivers.length})`, icon: Car },
                { id: 'accommodations', label: `Accommodations (${accommodations.length})`, icon: Building },
                { id: 'attendance', label: 'Attendance', icon: Activity },
                { id: 'leaves', label: 'Leave Requests', icon: Calendar },
                { id: 'assignments', label: `Assignments (${driverAssignments.length})`, icon: MapPin }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
} 