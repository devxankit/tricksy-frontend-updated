import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { CalendarCheck2, User as UserIcon, MapPin, Clock, Loader2 } from 'lucide-react';

export default function AttendanceList({ isAdmin = false, onUpdateStatus }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, [filters]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/attendance/${isAdmin ? 'admin/all' : 'user'}?${params}`);
      setAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
          <CardTitle>Loading attendance records...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (attendance.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-col items-center">
          <CalendarCheck2 className="h-10 w-10 text-gray-400 mb-2" />
          <CardTitle>No attendance records found</CardTitle>
          <CardDescription>All attendance records will appear here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CalendarCheck2 className="h-6 w-6 text-blue-600" />
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
      </Card>
      {/* Filters for Admin */}
      {isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Attendance Records */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {attendance.map((record) => (
          <Card key={record._id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{isAdmin ? record.userName : 'Your Attendance'}</span>
              </div>
              <CardTitle className="text-lg">{formatDate(record.date)}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-gray-400" />
                Check-in: {formatTime(record.checkInTime)}
                {record.checkOutTime && (
                  <>
                    <span className="mx-2">|</span>
                    Check-out: {formatTime(record.checkOutTime)}
                  </>
                )}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {/* Show userId (populated) name/email if present */}
              {record.userId && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  {record.userId.name} ({record.userId.email})
                </div>
              )}
              {/* Show driverId (populated) name/email if present */}
              {record.driverId && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  {record.driverId.name} ({record.driverId.email})
                </div>
              )}
              {isAdmin && !record.driver && !record.user && record.userEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  {record.userEmail}
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {record.location || 'N/A'}
                </div>
              )}
              {record.notes && (
                <div className="bg-blue-50 rounded-md p-2 text-xs text-blue-800 mt-2">
                  Notes: {record.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 