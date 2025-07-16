import React, { useState } from 'react';
import { Building, Image as ImageIcon, Video as VideoIcon, User as UserIcon, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import api from '../utils/api';

export default function AccommodationList({ accommodations = [], isAdmin = false, onUpdateStatus }) {
  const [expandedId, setExpandedId] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusUpdate = async (accommodationId, status) => {
    if (!isAdmin) return;
    
    console.log('🔄 Updating status:', { accommodationId, status, adminResponse });
    setLoading(true);
    
    try {
      const response = await api.put(`/accommodation/admin/${accommodationId}`, {
        status,
        adminResponse
      });
      
      console.log('✅ Status update successful:', response.data);
      
      // Show success message
      alert(`Status updated to: ${status}`);
      
      if (onUpdateStatus) {
        onUpdateStatus();
      }
      
      setAdminResponse('');
      setExpandedId(null);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Filter accommodations based on status
  const filteredAccommodations = statusFilter === 'all' 
    ? accommodations 
    : accommodations.filter(acc => acc.status === statusFilter);

  if (!accommodations.length) {
    return (
      <Card className="mt-8">
        <CardHeader className="flex flex-col items-center">
          <Building className="h-10 w-10 text-purple-400 mb-2" />
          <CardTitle>No Accommodation Requests</CardTitle>
          <CardDescription>All accommodation requests will appear here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const API_URL = api.defaults.baseURL.replace(/\/api$/, '') || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Building className="h-6 w-6 text-purple-600" />
          <CardTitle>Accommodation Requests</CardTitle>
        </CardHeader>
      </Card>

      {/* Status Filter for Admin */}
      {isAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', count: accommodations.length },
                { id: 'pending', label: 'Pending', count: accommodations.filter(acc => acc.status === 'pending').length },
                { id: 'in-progress', label: 'In Progress', count: accommodations.filter(acc => acc.status === 'in-progress').length },
                { id: 'approved', label: 'Approved', count: accommodations.filter(acc => acc.status === 'approved').length },
                { id: 'rejected', label: 'Rejected', count: accommodations.filter(acc => acc.status === 'rejected').length }
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={statusFilter === filter.id ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(filter.id)}
                  className="text-sm"
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAccommodations.length === 0 ? (
        <Card>
          <CardHeader className="flex flex-col items-center">
            <Building className="h-10 w-10 text-gray-400 mb-2" />
            <CardTitle>No {statusFilter !== 'all' ? statusFilter : ''} accommodation requests found</CardTitle>
            <CardDescription>Try changing the filter or check back later.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccommodations.map((accommodation) => (
            <Card key={accommodation._id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{accommodation.user?.name || accommodation.userName || 'Unknown User'}</span>
                </div>
                <CardTitle className="text-lg">{accommodation.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  {formatDate(accommodation.createdAt)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(accommodation.status)}`}>
                    {accommodation.status.charAt(0).toUpperCase() + accommodation.status.slice(1)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="mb-2 text-gray-700 whitespace-pre-wrap">{accommodation.message}</div>
                
                {/* Images */}
                {accommodation.images && accommodation.images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                      <ImageIcon className="h-4 w-4 text-blue-400" />
                      Photos ({accommodation.images.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {accommodation.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image.startsWith('http') ? image : `${API_URL}${image}`}
                          alt={`Accommodation ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
                          onClick={() => window.open(image.startsWith('http') ? image : `${API_URL}${image}`, '_blank')}
                          onError={e => e.target.src = 'https://via.placeholder.com/150x100?text=Image+Not+Found'}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Videos */}
                {accommodation.videos && accommodation.videos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                      <VideoIcon className="h-4 w-4 text-pink-400" />
                      Videos ({accommodation.videos.length})
                    </div>
                    <div className="space-y-2">
                      {accommodation.videos.map((video, idx) => (
                        <video
                          key={idx}
                          controls
                          className="w-full rounded-md"
                          onError={e => { e.target.style.display = 'none'; }}
                        >
                          <source src={video.startsWith('http') ? video : `${API_URL}${video}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Admin Response */}
                {accommodation.adminResponse && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 mb-1 text-blue-800 font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Admin Response
                    </div>
                    <div className="text-sm text-blue-700">{accommodation.adminResponse}</div>
                  </div>
                )}
                
                {/* Admin Actions */}
                {isAdmin && (
                  <div className="mt-4 space-y-3">
                    <Button
                      onClick={() => setExpandedId(expandedId === accommodation._id ? null : accommodation._id)}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {expandedId === accommodation._id ? 'Cancel' : 'Respond'}
                    </Button>
                    
                    {expandedId === accommodation._id && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Admin Response
                          </label>
                          <textarea
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            placeholder="Enter your response..."
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows="3"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(accommodation._id, 'pending')}
                            disabled={loading}
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pending'}
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(accommodation._id, 'in-progress')}
                            disabled={loading}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'In Progress'}
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(accommodation._id, 'approved')}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(accommodation._id, 'rejected')}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 