import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const LeaveList = ({ role, all }) => {
  const [leaves, setLeaves] = useState(all ? [] : { pending: [], approved: [], rejected: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  // Debug log
  console.log('LeaveList props:', { role, all, leaves });

  useEffect(() => {
    if (all) {
      fetchAllLeaves();
    } else {
      fetchLeavesByStatus();
    }
    // eslint-disable-next-line
  }, [all]);

  const fetchAllLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leaves/');
      setLeaves(res.data.leaves);
    } catch (err) {
      setError('Failed to fetch all leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeavesByStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, approved, rejected] = await Promise.all([
        api.get('/leaves/status/pending'),
        api.get('/leaves/status/approved'),
        api.get('/leaves/status/rejected'),
      ]);
      setLeaves({
        pending: pending.data.leaves,
        approved: approved.data.leaves,
        rejected: rejected.data.leaves,
      });
    } catch (err) {
      setError('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/leaves/${id}/status`, { status, adminResponse });
      setAdminResponse('');
      setExpandedId(null);
      if (all) fetchAllLeaves(); else fetchLeavesByStatus();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (all) {
    return (
      <div className="my-6">
        <h2 className="text-xl font-bold mb-4">All Leave Applications</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        <ul className="space-y-2">
          {leaves.length === 0 ? (
            <div className="text-gray-500">No leave applications found</div>
          ) : (
            leaves.map(leave => (
              <li key={leave._id} className="border-b pb-2">
                <div><span className="font-medium">From:</span> {leave.startDate?.slice(0,10)} <span className="font-medium">To:</span> {leave.endDate?.slice(0,10)}</div>
                <div><span className="font-medium">Reason:</span> {leave.reason}</div>
                {leave.driver && (
                  <div className="text-xs text-gray-600">Driver: {leave.driver.name} ({leave.driver.email})</div>
                )}
                {leave.user && (
                  <div className="text-xs text-gray-600">User: {leave.user.name} ({leave.user.email})</div>
                )}
                <div className="text-xs text-gray-500">Status: {leave.status}</div>
                {/* Show admin response if present */}
                {leave.adminResponse && (
                  <div className="bg-blue-50 rounded-md p-2 text-xs text-blue-800 mt-2">
                    Admin Response: {leave.adminResponse}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">Leave Requests</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['pending', 'approved', 'rejected'].map(status => (
          <div key={status} className="border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">{statusLabels[status]}</h3>
            {leaves[status].length === 0 ? (
              <div className="text-gray-500">No {statusLabels[status]} leaves</div>
            ) : (
              <ul className="space-y-2">
                {leaves[status].map(leave => (
                  <li key={leave._id} className="border-b pb-2">
                    <div><span className="font-medium">From:</span> {leave.startDate?.slice(0,10)} <span className="font-medium">To:</span> {leave.endDate?.slice(0,10)}</div>
                    <div><span className="font-medium">Reason:</span> {leave.reason}</div>
                    {role === 'admin' && leave.driver && (
                      <div className="text-xs text-gray-600">Driver: {leave.driver.name} ({leave.driver.email})</div>
                    )}
                    {role === 'admin' && leave.user && (
                      <div className="text-xs text-gray-600">User: {leave.user.name} ({leave.user.email})</div>
                    )}
                    <div className="text-xs text-gray-500">Status: {leave.status}</div>
                    {/* Show admin response if present */}
                    {leave.adminResponse && (
                      <div className="bg-blue-50 rounded-md p-2 text-xs text-blue-800 mt-2">
                        Admin Response: {leave.adminResponse}
                      </div>
                    )}
                    {/* Always show buttons for admin on pending leaves */}
                    {role === 'admin' && status === 'pending' && (
                      <div className="mt-2">
                        <button
                          className="text-xs text-blue-700 underline mr-2"
                          onClick={() => setExpandedId(expandedId === leave._id ? null : leave._id)}
                        >
                          {expandedId === leave._id ? 'Cancel' : 'Respond'}
                        </button>
                        {expandedId === leave._id && (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={adminResponse}
                              onChange={e => setAdminResponse(e.target.value)}
                              placeholder="Enter your response..."
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                className="text-white px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-xs"
                                disabled={actionLoading[leave._id]}
                                onClick={() => handleStatusChange(leave._id, 'approved')}
                              >
                                {actionLoading[leave._id] ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                className="text-white px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs"
                                disabled={actionLoading[leave._id]}
                                onClick={() => handleStatusChange(leave._id, 'rejected')}
                              >
                                {actionLoading[leave._id] ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveList; 