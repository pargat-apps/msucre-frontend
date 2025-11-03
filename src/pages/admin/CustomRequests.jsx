import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaCheck, FaTimes, FaImage, FaBirthdayCake, FaCalendarAlt, FaEnvelope, FaPhone, FaPalette, FaRuler, FaLayerGroup } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatDateTime, formatPrice } from '../../utils/helpers';

const CustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Define sequential custom cake status steps
  const customCakeSteps = [
    'pending',
    'quoted',
    'approved',
    'design-confirmed',
    'in-production',
    'ready',
    'completed'
  ];

  useEffect(() => {
    fetchRequests(true);
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/custom-requests');
      setRequests(response.data.data || []);
    } catch (error) {
      if (showLoading) {
        toast.error('Failed to fetch custom requests');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getNextSteps = (request) => {
    const currentStatus = request.status;
    const currentIndex = customCakeSteps.findIndex(step => step === currentStatus);
    
    if (currentStatus === 'cancelled' || currentStatus === 'completed') {
      return [];
    }

    if (currentIndex >= 0) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < customCakeSteps.length) {
        return [customCakeSteps[nextIndex]];
      }
    }

    return [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Review',
      'quoted': 'Quote Provided',
      'approved': 'Approved',
      'design-confirmed': 'Design Confirmed',
      'in-production': 'In Production',
      'ready': 'Ready for Pickup',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const provideQuote = async (requestId, customerName) => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }

    try {
      await api.put(`/custom-requests/${requestId}`, {
        priceQuote: parseFloat(quoteAmount),
        status: 'quoted',
        note: `Quote of ${formatPrice(parseFloat(quoteAmount))} provided to customer`
      });
      toast.success(`Quote sent to ${customerName}! 💰`);
      setSelectedRequest(null);
      setQuoteAmount('');
      fetchRequests(false);
    } catch (error) {
      toast.error('Failed to provide quote');
    }
  };

  const updateStatus = async (requestId, status, customerName, note = '') => {
    try {
      await api.put(`/custom-requests/${requestId}`, { 
        status,
        note: note || `Status updated to ${getStatusLabel(status)}`
      });
      toast.success(`Custom cake for ${customerName} updated to: ${getStatusLabel(status)}`);
      fetchRequests(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCancelRequest = async (requestId, customerName) => {
    if (window.confirm(`Are you sure you want to cancel the request for ${customerName}?`)) {
      try {
        await api.put(`/custom-requests/${requestId}`, { 
          status: 'cancelled',
          note: 'Custom cake request cancelled by admin'
        });
        toast.success(`Request for ${customerName} has been cancelled`);
        fetchRequests(false);
      } catch (error) {
        toast.error('Failed to cancel request');
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Get backend URL - handle both relative and absolute URLs
    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // If VITE_API_URL is a relative path like '/api', we need the backend port
    if (backendUrl.startsWith('/api')) {
      // Backend runs on port 5000, frontend on different port
      // Extract port from current location or use default 5000
      const currentPort = window.location.port;
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // If frontend is on 3000/3001, backend is on 5000
      backendUrl = isDev ? `http://localhost:5000` : window.location.origin.replace(/:\d+$/, ':5000');
    } else if (!backendUrl.startsWith('http')) {
      // If it's not a full URL, use localhost:5000 in dev, origin in prod
      backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    }
    
    // Ensure image path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Combine backend URL with image path
    const fullUrl = `${backendUrl}${path}`;
    return fullUrl;
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = !search || 
      request.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      request.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      request._id.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || request.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Separate requests by status
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const quotedRequests = filteredRequests.filter(r => r.status === 'quoted');
  const activeRequests = filteredRequests.filter(r => 
    ['approved', 'design-confirmed', 'in-production', 'ready'].includes(r.status)
  );
  const completedRequests = filteredRequests.filter(r => r.status === 'completed');
  const cancelledRequests = filteredRequests.filter(r => r.status === 'cancelled');

  // Render Request Card Component
  const RequestCard = ({ request }) => {
    const nextSteps = getNextSteps(request);
    const hasReferenceImages = request.referenceImages && request.referenceImages.length > 0;

    return (
      <div className="card p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{request.customerName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                request.status === 'design-confirmed' ? 'bg-purple-100 text-purple-800' :
                request.status === 'in-production' ? 'bg-indigo-100 text-indigo-800' :
                request.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(request.status)}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <FaEnvelope className="text-xs" />
                <span>{request.customerEmail}</span>
              </div>
              {request.customerPhone && (
                <div className="flex items-center space-x-1">
                  <FaPhone className="text-xs" />
                  <span>{request.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Reference Images Preview */}
          {hasReferenceImages && (
            <div className="flex space-x-2 ml-4">
              {request.referenceImages.slice(0, 2).map((image, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(image.url)}
                  alt={`Reference ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64x64?text=Image';
                  }}
                />
              ))}
              {request.referenceImages.length > 2 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  +{request.referenceImages.length - 2}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cake Specifications */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaBirthdayCake className="text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Flavor</p>
              <p className="font-semibold text-gray-900">{request.flavor}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaRuler className="text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Size</p>
              <p className="font-semibold text-gray-900 text-sm">{request.size}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaLayerGroup className="text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Layers</p>
              <p className="font-semibold text-gray-900">{request.layers}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="font-semibold text-gray-900 text-xs">{new Date(request.deadlineAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2 mb-4">
          {request.shape && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Shape:</span>
              <span className="font-medium">{request.shape}</span>
            </div>
          )}
          {request.fillings && request.fillings.length > 0 && (
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-gray-500">Fillings:</span>
              <div className="flex flex-wrap gap-1">
                {request.fillings.map((filling, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                    {filling}
                  </span>
                ))}
              </div>
            </div>
          )}
          {request.icing && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Icing:</span>
              <span className="font-medium">{request.icing}</span>
            </div>
          )}
          {request.theme && (
            <div className="flex items-center space-x-2 text-sm">
              <FaPalette className="text-gray-400" />
              <span className="text-gray-500">Theme:</span>
              <span className="font-medium">{request.theme}</span>
            </div>
          )}
          {request.messageOnCake && (
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-gray-500">Message:</span>
              <span className="font-medium text-primary-600">"{request.messageOnCake}"</span>
            </div>
          )}
          {request.dietaryRequirements && request.dietaryRequirements.length > 0 && (
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-gray-500">Dietary:</span>
              <div className="flex flex-wrap gap-1">
                {request.dietaryRequirements.map((req, idx) => (
                  <span key={idx} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {request.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
            <p className="text-sm text-gray-700">{request.notes}</p>
          </div>
        )}

        {request.priceQuote > 0 && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-900">
              <span className="font-semibold">Quote Provided:</span> {formatPrice(request.priceQuote)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
          <Link
            to={`/admin/custom-cakes/${request._id}`}
            className="btn-outline text-sm flex items-center space-x-2"
          >
            <FaEye />
            <span>View Timeline</span>
          </Link>

          {/* Next Step Buttons */}
          {nextSteps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nextSteps.map((step) => {
                if (step === 'design-confirmed' && hasReferenceImages) {
                  return (
                    <button
                      key={step}
                      onClick={() => {
                        // You can open a design confirmation modal here similar to orders
                        updateStatus(request._id, step, request.customerName);
                      }}
                      className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-1"
                    >
                      <FaImage className="text-xs" />
                      <span>Confirm Design</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={step}
                    onClick={() => updateStatus(request._id, step, request.customerName)}
                    className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-1"
                  >
                    <FaCheck className="text-xs" />
                    <span>{getStatusLabel(step)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Status is pending - show provide quote */}
          {request.status === 'pending' && (
            <button
              onClick={() => setSelectedRequest(request)}
              className="btn-primary text-sm flex items-center space-x-2"
            >
              <FaEnvelope />
              <span>Provide Quote</span>
            </button>
          )}

          {/* Cancel button for non-completed/cancelled */}
          {request.status !== 'completed' && request.status !== 'cancelled' && (
            <button
              onClick={() => handleCancelRequest(request._id, request.customerName)}
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-1"
            >
              <FaTimes className="text-xs" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading custom cake requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Custom Cake Requests</h1>
          <p className="text-gray-600">
            Manage all custom cake requests with detailed timeline tracking
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-xs text-gray-600 mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingRequests.length}</p>
          </div>
          <div className="card p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 mb-1">Quoted</p>
            <p className="text-2xl font-bold text-blue-700">{quotedRequests.length}</p>
          </div>
          <div className="card p-4 bg-indigo-50 border-l-4 border-indigo-500">
            <p className="text-xs text-gray-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-indigo-700">{activeRequests.length}</p>
          </div>
          <div className="card p-4 bg-gray-50 border-l-4 border-gray-500">
            <p className="text-xs text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-700">{completedRequests.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending Review</option>
                <option value="quoted">Quoted (Awaiting Approval)</option>
                <option value="approved">Approved</option>
                <option value="design-confirmed">Design Confirmed</option>
                <option value="in-production">In Production</option>
                <option value="ready">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Requests Section */}
        {(filter === 'all' || filter === 'pending') && pendingRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                <span>Pending Review ({pendingRequests.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {pendingRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Quoted Requests Section */}
        {(filter === 'all' || filter === 'quoted') && quotedRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Quoted - Awaiting Approval ({quotedRequests.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {quotedRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Active Requests Section */}
        {(filter === 'all' || ['approved', 'design-confirmed', 'in-production', 'ready'].includes(filter)) && activeRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                <span>In Progress ({activeRequests.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {activeRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Requests Section */}
        {(filter === 'all' || filter === 'completed') && completedRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                <span>Completed ({completedRequests.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {completedRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Requests Section */}
        {(filter === 'all' || filter === 'cancelled') && cancelledRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>Cancelled ({cancelledRequests.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {cancelledRequests.map((request) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="card p-12 text-center">
            <FaBirthdayCake className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Custom Cake Requests</h2>
            <p className="text-gray-600">
              {search || filter !== 'all' 
                ? 'No requests match your search criteria'
                : 'Custom cake requests will appear here once customers submit them'}
            </p>
          </div>
        )}

        {/* Quote Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold">Provide Quote</h2>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setQuoteAmount('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">For: {selectedRequest.customerName}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quote Amount (CAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="input-field"
                    placeholder="125.00"
                    autoFocus
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Details:</strong><br />
                    {selectedRequest.flavor} • {selectedRequest.size} • {selectedRequest.layers} layer{selectedRequest.layers > 1 ? 's' : ''}
                    {selectedRequest.shape && ` • ${selectedRequest.shape}`}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setQuoteAmount('');
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => provideQuote(selectedRequest._id, selectedRequest.customerName)}
                    className="btn-primary flex-1"
                  >
                    Send Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomRequests;
