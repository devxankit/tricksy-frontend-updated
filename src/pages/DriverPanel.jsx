import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceList from '../components/AttendanceList';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import DriverLocationUpdater from '../components/DriverLocationUpdater';
import DriverAssignmentList from '../components/DriverAssignmentList';

export default function DriverPanel() {
  const [driver, setDriver] = useState(null);
  const [driverAssignments, setDriverAssignments] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '', busNumber: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const driverData = localStorage.getItem('user');
    if (driverData) {
      setDriver(JSON.parse(driverData));
      setEditForm(JSON.parse(driverData));
    }
    fetchDriverAssignments();
    fetchCompletedAssignments();
  }, []);

  const fetchDriverAssignments = async () => {
    try {
      // Get driver from localStorage (or from state)
      const driverData = localStorage.getItem('user');
      const driver = driverData ? JSON.parse(driverData) : null;
      // Handle both id and _id for backward compatibility
      const driverId = driver?._id || driver?.id;

      if (!driverId) {
        setDriverAssignments([]);
        return;
      }

      const response = await api.get(`/driver-assignment/driver/${driverId}`);
      setDriverAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching driver assignments:', error);
      setDriverAssignments([]);
    }
  };

  const fetchCompletedAssignments = async () => {
    try {
      // Get driver from localStorage (or from state)
      const driverData = localStorage.getItem('user');
      const driver = driverData ? JSON.parse(driverData) : null;
      // Handle both id and _id for backward compatibility
      const driverId = driver?._id || driver?.id;

      if (!driverId) {
        setCompletedAssignments([]);
        return;
      }

      const response = await api.get(`/driver-assignment/driver/${driverId}?status=completed`);
      setCompletedAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error fetching completed assignments:', error);
      setCompletedAssignments([]);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/driver/profile', editForm);
      setDriver(res.data.driver);
      localStorage.setItem('user', JSON.stringify(res.data.driver));
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">Driver Dashboard</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t">
            <div className="flex flex-col">
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'profile'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'profile' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
              <button
                onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'attendance'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'attendance' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Attendance</span>
              </button>
              <button
                onClick={() => { setActiveTab('leave'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'leave'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'leave' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Leave</span>
              </button>
              <button
                onClick={() => { setActiveTab('location-sharing'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'location-sharing'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'location-sharing' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Share Location</span>
              </button>
              <button
                onClick={() => { setActiveTab('assignments'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'assignments'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'assignments' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>My Assignments ({driverAssignments.length})</span>
              </button>
              <button
                onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                className={`px-4 py-3 text-sm font-medium text-left flex items-center space-x-3 ${
                  activeTab === 'history'
                    ? 'text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                style={{ backgroundColor: activeTab === 'history' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Assignment History ({completedAssignments.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-white shadow-lg h-screen flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'profile' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'profile' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'attendance' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'attendance' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Attendance</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('leave')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'leave' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'leave' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Leave</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('location-sharing')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'location-sharing' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'location-sharing' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Share Location</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('assignments')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'assignments' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'assignments' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>My Assignments ({driverAssignments.length})</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-4 py-2 rounded transition-colors flex items-center space-x-3 ${
                  activeTab === 'history' ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                style={{ backgroundColor: activeTab === 'history' ? '#5C2D91' : undefined }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Assignment History ({completedAssignments.length})</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        {activeTab === 'profile' && (
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900 mb-4">
                Welcome, {driver?.name || 'Driver'}!
              </h3>
              {driver && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h4>
                    {!editMode ? (
                      <>
                        <div className="space-y-2 sm:space-y-3">
                          <p className="text-sm sm:text-base">
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-900">{driver.name}</span>
                          </p>
                          <p className="text-sm sm:text-base">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="ml-2 text-gray-900">{driver.email}</span>
                          </p>
                          <p className="text-sm sm:text-base">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="ml-2 text-gray-900">{driver.phone}</span>
                          </p>
                          <p className="text-sm sm:text-base">
                            <span className="font-medium text-gray-700">Address:</span>
                            <span className="ml-2 text-gray-900">{driver.address}</span>
                          </p>
                          {driver.busNumber && (
                            <p className="text-sm sm:text-base">
                              <span className="font-medium text-gray-700">Bus Number:</span>
                              <span className="ml-2 text-gray-900">{driver.busNumber}</span>
                            </p>
                          )}
                        </div>
                        <button onClick={() => setEditMode(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit</button>
                      </>
                    ) : (
                      <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="border p-2 rounded w-full" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="border p-2 rounded w-full" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} className="border p-2 rounded w-full" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <input type="text" name="address" value={editForm.address} onChange={handleEditChange} className="border p-2 rounded w-full" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bus Number</label>
                          <input type="text" name="busNumber" value={editForm.busNumber} onChange={handleEditChange} className="border p-2 rounded w-full" />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                          <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                    <h4 className="text-sm font-medium text-green-700 mb-3">Account Status</h4>
                    <div className="space-y-2">
                      <p className="text-green-600 text-sm sm:text-base">✓ Active Driver Account</p>
                      <p className="text-sm text-green-500">You can access driver-specific features here.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <AttendanceForm />
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">My Attendance History</h3>
              </div>
              <div className="p-6">
                <AttendanceList />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'leave' && (
          <div className="space-y-6">
            <LeaveForm />
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">My Leave Applications</h3>
              </div>
              <div className="p-6">
                <LeaveList role="driver" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location-sharing' && (
          <div className="space-y-6">
            <DriverLocationUpdater driverId={driver?._id} />
          </div>
        )}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">My Driver Assignments</h2>
              <DriverAssignmentList 
                assignments={driverAssignments}
                  onUpdate={fetchDriverAssignments}
                isDriver={true}
                />
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-6xl mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Assignment History</h2>
              <p className="text-gray-600 mb-4">Completed assignments and past tasks</p>
              <DriverAssignmentList 
                assignments={completedAssignments}
                onUpdate={fetchCompletedAssignments}
                isDriver={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 