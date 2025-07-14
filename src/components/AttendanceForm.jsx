import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AttendanceForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [status, setStatus] = useState('present');
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    checkTodayAttendance();
  }, []);

  const checkTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/user');
      const today = new Date().toDateString();
      const todayRecord = response.data.attendance.find(record => 
        new Date(record.date).toDateString() === today
      );
      setTodayAttendance(todayRecord);
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = { status };
      if (status === 'leave') payload.notes = leaveReason;
      await api.post('/attendance/mark', payload);
      setMessage('Attendance marked successfully!');
      setStatus('present');
      setLeaveReason('');
      checkTodayAttendance();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
      {message && (
        <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-700">{message}</div>
      )}
      {todayAttendance ? (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Today's Attendance</h4>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              todayAttendance.status === 'present' ? 'bg-green-100 text-green-800' :
              todayAttendance.status === 'absent' ? 'bg-red-100 text-red-800' :
              todayAttendance.status === 'leave' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
            </span>
          </div>
          {todayAttendance.status === 'leave' && todayAttendance.notes && (
            <div className="mt-2 text-sm text-yellow-800">Reason: {todayAttendance.notes}</div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input type="radio" name="status" value="present" checked={status === 'present'} onChange={() => setStatus('present')} />
                Present
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="status" value="absent" checked={status === 'absent'} onChange={() => setStatus('absent')} />
                Absent
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="status" value="leave" checked={status === 'leave'} onChange={() => setStatus('leave')} />
                Leave
              </label>
            </div>
          </div>
          {status === 'leave' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Reason</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                style={{ focusRing: '#5C2D91' }}
                rows="2"
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="Enter reason for leave..."
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            style={{ backgroundColor: '#5C2D91' }}
          >
            {loading ? 'Submitting...' : 'Mark Attendance'}
          </button>
        </form>
      )}
    </div>
  );
} 