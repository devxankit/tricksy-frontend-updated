import React, { useState } from 'react';
import api from '../utils/api';

export default function DriverAssignmentList({ assignments, onUpdate, isAdmin = false, isDriver = false }) {
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const handleStatusUpdate = async (assignmentId, userId, newStatus) => {
    if (!window.confirm(`Mark user as ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(`${assignmentId}-${userId}`);
    try {
      const response = await api.patch(`/driver-assignment/${assignmentId}/user-status`, {
        userId,
        status: newStatus
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await api.delete(`/driver-assignment/${assignmentId}`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No driver assignments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Driver: {assignment.driverName} (Bus {assignment.busNumber})
              </h3>
              <p className="text-sm text-gray-600">
                Assigned by: {assignment.assignedByName} on {new Date(assignment.assignmentDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                {assignment.status}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(assignment._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Pickup Location</h4>
              <p className="text-sm text-gray-700">{assignment.pickupLocation}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {assignment.pickupCoordinates.latitude.toFixed(6)}, {assignment.pickupCoordinates.longitude.toFixed(6)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Drop Location</h4>
              <p className="text-sm text-gray-700">{assignment.dropLocation}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {assignment.dropCoordinates.latitude.toFixed(6)}, {assignment.dropCoordinates.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Assigned Users */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Assigned Users ({assignment.assignedUsers.length})</h4>
            <div className="space-y-2">
              {assignment.assignedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.userEmail} • {user.userPhone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    {isDriver && assignment.status === 'active' && user.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(assignment._id, user.userId, 'picked')}
                        disabled={updatingStatus === `${assignment._id}-${user.userId}`}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingStatus === `${assignment._id}-${user.userId}` ? 'Updating...' : 'Mark Picked'}
                      </button>
                    )}
                    {isDriver && assignment.status === 'active' && user.status === 'picked' && (
                      <button
                        onClick={() => handleStatusUpdate(assignment._id, user.userId, 'dropped')}
                        disabled={updatingStatus === `${assignment._id}-${user.userId}`}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingStatus === `${assignment._id}-${user.userId}` ? 'Updating...' : 'Mark Dropped'}
                      </button>
                    )}
                    {isDriver && assignment.status === 'completed' && (
                      <span className="text-xs text-gray-500 italic">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {assignment.notes && (
            <div className="bg-yellow-50 p-3 rounded">
              <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
              <p className="text-sm text-gray-700">{assignment.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 