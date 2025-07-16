import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function UserDriverTracker() {
  const [assignment, setAssignment] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignment();
    const interval = setInterval(fetchDriverLocation, 30000); // Update every 30 seconds
    const assignmentInterval = setInterval(fetchAssignment, 10000); // Refresh assignment every 10 seconds
    return () => {
      clearInterval(interval);
      clearInterval(assignmentInterval);
    };
  }, []);

  const fetchAssignment = async () => {
    try {
      const response = await api.get('/driver-assignment/user');
      setAssignment(response.data.assignment);
      fetchDriverLocation();
    } catch (error) {
      if (error.response?.status === 404) {
        setError('No active assignment found');
      } else {
        setError('Failed to fetch assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverLocation = async () => {
    try {
      const response = await api.get('/driver-assignment/user/driver-location');
      setDriverLocation(response.data.driverLocation);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setDriverLocation(null);
          setError('Your assigned driver is currently offline or has not updated their location yet. Please wait or contact support.');
          // Silenced 404 error in console
          // console.error('Backend error response:', error.response);
        } else {
          // Only log non-404 errors
          console.error('Error fetching driver location:', error);
          console.error('Backend error response:', error.response);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading assignment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">{error}</p>
          <p className="text-sm text-yellow-600 mt-1">
            You don't have any active driver assignments at the moment.
          </p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active assignment found.</p>
      </div>
    );
  }

  const formatDistance = (distance) => {
    if (distance === null) return 'Calculating...';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Find user's status in the assignment
  const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = userData?._id || userData?.id;
  const userStatus = assignment.assignedUsers.find(user => user.userId === userId)?.status || 'pending';

  return (
    <div className="space-y-6">
      {/* Assignment Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Driver Assignment</h2>
            <p className="text-sm text-gray-600">
              Assigned on {new Date(assignment.assignmentDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userStatus)}`}>
            {userStatus}
          </span>
        </div>

        {/* Driver Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Driver Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Driver Name</p>
              <p className="font-medium">{assignment.driverName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bus Number</p>
              <p className="font-medium">{assignment.busNumber}</p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Pickup Location</h4>
            <p className="text-gray-700">{assignment.pickupLocation}</p>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {assignment.pickupCoordinates.latitude.toFixed(6)}, {assignment.pickupCoordinates.longitude.toFixed(6)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Drop Location</h4>
            <p className="text-gray-700">{assignment.dropLocation}</p>
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {assignment.dropCoordinates.latitude.toFixed(6)}, {assignment.dropCoordinates.longitude.toFixed(6)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {assignment.notes && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-gray-700">{assignment.notes}</p>
          </div>
        )}
      </div>

      {/* Live Driver Location */}
      {driverLocation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Driver Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Distance to Pickup</h4>
              <p className="text-2xl font-bold text-blue-600">
                {formatDistance(driverLocation.distanceToPickup)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Distance to Drop</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatDistance(driverLocation.distanceToDrop)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Driver Status</h4>
              <p className="text-2xl font-bold text-purple-600">
                {driverLocation.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Driver Location Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Driver Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Address</p>
                <p className="text-gray-700">{driverLocation.address || 'Location not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-gray-700">
                  {new Date(driverLocation.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {driverLocation.speed > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Speed</p>
                <p className="text-gray-700">{driverLocation.speed.toFixed(1)} km/h</p>
              </div>
            )}
          </div>
        </div>
      )}
      {assignment && !driverLocation && error && (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">{error}</p>
            <p className="text-sm text-yellow-600 mt-1">
              Your driver may be offline or not sharing their location yet.
            </p>
          </div>
        </div>
      )}

      {/* Status Instructions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900">Pending</p>
              <p className="text-sm text-gray-600">Driver is on the way to pickup location</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900">Picked</p>
              <p className="text-sm text-gray-600">Driver has picked you up and is heading to drop location</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-gray-900">Dropped</p>
              <p className="text-sm text-gray-600">You have been dropped at your destination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 