import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import gpsService from '../services/gpsService';

export default function DriverLocationUpdater({ driverId }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [gpsPermission, setGpsPermission] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    checkGPSPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (isSharing) {
      interval = setInterval(updateLocation, 10000); // Update every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSharing]);

  const checkGPSPermission = async () => {
    const hasPermission = await gpsService.checkGPSPermission();
    setGpsPermission(hasPermission);
  };

  const requestGPSPermission = async () => {
    const granted = await gpsService.requestGPSPermission();
    setGpsPermission(granted);
    if (granted) {
      alert('GPS permission granted! You can now share your location.');
    } else {
      alert('GPS permission denied. Location sharing will not work.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await gpsService.getCurrentPosition();
      setCurrentLocation(position);
      return position;
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Unable to get current location. Please enable GPS permissions.');
      return null;
    }
  };

  const updateLocation = async () => {
    if (!currentLocation) {
      const position = await getCurrentLocation();
      if (!position) return;
    }

    try {
      const response = await api.post('/driver-location/update', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        speed: speed,
        heading: heading
      });

      setLastUpdate(new Date());
      setError('');
    } catch (error) {
      setError('Failed to update location. Please try again.');
      console.error('Error updating location:', error);
    }
  };

  const startSharing = async () => {
    if (!gpsPermission) {
      const granted = await requestGPSPermission();
      if (!granted) return;
    }

    const position = await getCurrentLocation();
    if (position) {
      setIsSharing(true);
      updateLocation();
    }
  };

  const stopSharing = async () => {
    setIsSharing(false);
    try {
      await api.post('/driver-location/offline');
      setError('');
    } catch (error) {
      console.error('Error going offline:', error);
    }
  };

  const manualUpdate = async () => {
    await updateLocation();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🚌 Share Bus Location</h3>
        <div className="flex items-center space-x-2">
          {!gpsPermission && (
            <button
              onClick={requestGPSPermission}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            >
              Enable GPS
            </button>
          )}
          {gpsPermission && !isSharing && (
            <button
              onClick={startSharing}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Start Sharing
            </button>
          )}
          {isSharing && (
            <button
              onClick={stopSharing}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Stop Sharing
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {currentLocation && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Current Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">GPS:</span> {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Accuracy:</span> ±{Math.round(currentLocation.accuracy)} meters
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Speed:</span> {speed.toFixed(1)} km/h
              </p>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Heading:</span> {heading}°
              </p>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-blue-600 mt-2">
              Last Update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Speed and Heading Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed (km/h)
          </label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="0"
            max="120"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heading (degrees)
          </label>
          <input
            type="number"
            value={heading}
            onChange={(e) => setHeading(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="0"
            max="360"
            step="1"
          />
        </div>
      </div>

      {/* Status Information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">GPS Permission:</span>
            <span className={`text-sm ${gpsPermission ? 'text-green-600' : 'text-red-600'}`}>
              {gpsPermission ? '✓ Granted' : '✗ Denied'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location Sharing:</span>
            <span className={`text-sm ${isSharing ? 'text-green-600' : 'text-gray-600'}`}>
              {isSharing ? '✓ Active' : '✗ Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location Available:</span>
            <span className={`text-sm ${currentLocation ? 'text-green-600' : 'text-red-600'}`}>
              {currentLocation ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={manualUpdate}
          disabled={!currentLocation}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Update Location Now
        </button>
        <button
          onClick={getCurrentLocation}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Refresh GPS
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Instructions</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Enable GPS permission to share your location</li>
          <li>• Click "Start Sharing" to begin real-time location updates</li>
          <li>• Your location will be shared with assigned users</li>
          <li>• Update speed and heading for accurate tracking</li>
          <li>• Click "Stop Sharing" when you're done</li>
        </ul>
      </div>
    </div>
  );
} 