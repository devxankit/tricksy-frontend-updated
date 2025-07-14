import React, { useState } from 'react';
import api from '../utils/api';

export default function AccommodationForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    message: ''
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setVideos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setError('Please fill in title and message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('message', form.message);

      // Add images
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      // Add videos
      videos.forEach((video, index) => {
        formData.append('videos', video);
      });

      const response = await api.post('/accommodation/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm({ title: '', message: '' });
      setImages([]);
      setVideos([]);
      
      if (onSuccess) {
        onSuccess(response.data.accommodation);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create accommodation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Submit Accommodation Request</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            style={{ focusRing: '#5C2D91' }}
            placeholder="Enter accommodation title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            style={{ focusRing: '#5C2D91' }}
            placeholder="Describe your accommodation request..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (optional) - Max 5 files
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            style={{ focusRing: '#5C2D91' }}
          />
          {images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                {images.length} image(s) selected:
              </p>
              <div className="space-y-1">
                {images.map((file, index) => (
                  <p key={index} className="text-xs text-gray-500">
                    📷 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Videos (optional) - Max 3 files, 50MB each
          </label>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            style={{ focusRing: '#5C2D91' }}
          />
          {videos.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">
                {videos.length} video(s) selected:
              </p>
              <div className="space-y-1">
                {videos.map((file, index) => (
                  <p key={index} className="text-xs text-gray-500">
                    🎥 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          style={{ backgroundColor: '#5C2D91' }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
} 