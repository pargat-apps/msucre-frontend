import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import api from '../utils/api';
import CustomCakeTimeline from '../components/CustomCakeTimeline';
import Loading from '../components/Loading';
import { useToast } from '../components/Toast';

const CustomCakeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRequest();
    // Auto-refresh every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchRequest(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchRequest = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/custom-requests/${id}`);
      setRequest(response.data.data);
    } catch (error) {
      console.error('Error fetching custom request:', error);
      if (showLoading) {
        toast.error('Failed to load custom cake request');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;
  if (!request) return <div className="text-center py-12">Custom cake request not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <Link to="/admin/custom-requests" className="text-gray-600 hover:text-gray-900">
                  <FaArrowLeft />
                </Link>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Custom Cake Request
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
                Request ID: {request._id.substring(request._id.length - 8)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link to="/admin/custom-requests" className="btn-outline">
                Back to List
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CustomCakeTimeline request={request} />
          </div>

          {/* Customer Information & Actions - 1 column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FaUser />
                <span>Customer Information</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{request.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${request.customerEmail}`} className="font-medium text-primary-600 hover:underline flex items-center space-x-1">
                    <FaEnvelope className="text-xs" />
                    <span>{request.customerEmail}</span>
                  </a>
                </div>
                {request.customerPhone && (
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${request.customerPhone}`} className="font-medium text-primary-600 hover:underline flex items-center space-x-1">
                      <FaPhone className="text-xs" />
                      <span>{request.customerPhone}</span>
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 mb-1">Request Date</p>
                  <p className="font-medium text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/admin/custom-requests`}
                  className="block w-full btn-outline text-center"
                >
                  Manage All Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCakeDetail;

