import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useRef } from 'react';

// Utility to load Google Maps script only once
const loadGoogleMapsScript = (() => {
  let scriptLoadingPromise;
  return () => {
    if (window.google && window.google.maps) return Promise.resolve();
    if (scriptLoadingPromise) return scriptLoadingPromise;
    scriptLoadingPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return scriptLoadingPromise;
  };
})();

function GoogleMapPicker({ label, lat, lng, onPick, locationName }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Geocode location name when it changes
  useEffect(() => {
    if (locationName && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: locationName }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          onPick({ lat: loc.lat(), lng: loc.lng() });
        }
      });
    }
    // eslint-disable-next-line
  }, [locationName]);

  useEffect(() => {
    let mapInstance;
    loadGoogleMapsScript().then(() => {
      if (!mapContainerRef.current) return;
      const center = { lat: lat || 20.5937, lng: lng || 78.9629 };
      mapInstance = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 5,
      });
      mapRef.current = mapInstance;
      markerRef.current = new window.google.maps.Marker({
        map: mapInstance,
        position: center,
        draggable: true,
      });
      mapInstance.addListener('click', (e) => {
        markerRef.current.setPosition(e.latLng);
        onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
      markerRef.current.addListener('dragend', (e) => {
        onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    });
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      markerRef.current.setPosition({ lat, lng });
      mapRef.current.setCenter({ lat, lng });
    }
  }, [lat, lng]);
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div ref={mapContainerRef} style={{ width: '100%', height: '200px', borderRadius: '8px', border: '1px solid #ccc' }} />
    </div>
  );
}

export default function DriverAssignmentForm({ onAssignmentCreated, loading = false }) {
  const [formData, setFormData] = useState({
    driverId: '',
    userIds: [],
    pickupLocation: '',
    dropLocation: '',
    pickupLatitude: '',
    pickupLongitude: '',
    dropLatitude: '',
    dropLongitude: '',
    notes: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
    fetchUsers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/admin/all-drivers');
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/all-users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      userIds: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate coordinates
    if (!formData.pickupLatitude || !formData.pickupLongitude || 
        !formData.dropLatitude || !formData.dropLongitude) {
      setError('All coordinates are required');
      return;
    }

    if (formData.userIds.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!formData.driverId) {
      setError('Please select a driver');
      return;
    }

    try {
      const assignmentData = {
        driverId: formData.driverId,
        userIds: formData.userIds,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        pickupCoordinates: {
          latitude: parseFloat(formData.pickupLatitude),
          longitude: parseFloat(formData.pickupLongitude)
        },
        dropCoordinates: {
          latitude: parseFloat(formData.dropLatitude),
          longitude: parseFloat(formData.dropLongitude)
        },
        notes: formData.notes
      };

      const response = await api.post('/driver-assignment/assign', assignmentData);
      
      setMessage('Driver assignment created successfully!');
      
      // Reset form
      setFormData({
        driverId: '',
        userIds: [],
        pickupLocation: '',
        dropLocation: '',
        pickupLatitude: '',
        pickupLongitude: '',
        dropLatitude: '',
        dropLongitude: '',
        notes: ''
      });

      if (onAssignmentCreated) {
        onAssignmentCreated(response.data.assignment);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Assign Driver to Users</h3>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Driver Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Driver *
          </label>
          <select
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Choose a driver</option>
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>
                {driver.name} - Bus {driver.busNumber}
              </option>
            ))}
          </select>
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Users * (Hold Ctrl/Cmd to select multiple)
          </label>
          <select
            multiple
            value={formData.userIds}
            onChange={handleUserSelection}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            size="4"
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Selected: {formData.userIds.length} users
          </p>
        </div>

        {/* Pickup Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location *
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder="e.g., Central Station"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <GoogleMapPicker
              label="Pick Pickup Location on Map"
              lat={formData.pickupLatitude ? parseFloat(formData.pickupLatitude) : undefined}
              lng={formData.pickupLongitude ? parseFloat(formData.pickupLongitude) : undefined}
              onPick={({ lat, lng }) => setFormData(prev => ({ ...prev, pickupLatitude: lat, pickupLongitude: lng }))}
              locationName={formData.pickupLocation}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drop Location *
            </label>
            <input
              type="text"
              name="dropLocation"
              value={formData.dropLocation}
              onChange={handleChange}
              placeholder="e.g., Office Building"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <GoogleMapPicker
              label="Pick Drop Location on Map"
              lat={formData.dropLatitude ? parseFloat(formData.dropLatitude) : undefined}
              lng={formData.dropLongitude ? parseFloat(formData.dropLongitude) : undefined}
              onPick={({ lat, lng }) => setFormData(prev => ({ ...prev, dropLatitude: lat, dropLongitude: lng }))}
              locationName={formData.dropLocation}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? 'Creating Assignment...' : 'Create Assignment'}
        </button>
      </form>
    </div>
  );
} 