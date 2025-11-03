import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaCheck, FaTimes, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatPrice, formatDateTime, getOrderStatusColor } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [designViewModal, setDesignViewModal] = useState({ open: false, order: null, images: [] });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paymentMatchModal, setPaymentMatchModal] = useState({ open: false });
  const [paymentSearch, setPaymentSearch] = useState({ customerName: '', customerEmail: '', amount: '', date: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const toast = useToast();

  // Define the sequential order steps (excluding Cancelled)
  const orderSteps = [
    'Awaiting e-Transfer',
    'Payment Received',
    'Design Confirmed',
    'In Preparation',
    'Ready for Pickup', // Will be replaced with 'Out for Delivery' for delivery orders
    'Completed'
  ];

  // Get next available step(s) for an order
  const getNextSteps = (order) => {
    const currentStatus = order.status;
    const currentIndex = orderSteps.findIndex(step => step === currentStatus);
    
    // If order is cancelled or completed, no next steps
    if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
      return [];
    }

    // Special case: Order Placed -> next step is Awaiting e-Transfer
    if (currentStatus === 'Order Placed') {
      return ['Awaiting e-Transfer'];
    }

    // Special case: Payment Received -> next step could be Design Confirmed (custom cakes only) or In Preparation
    if (currentStatus === 'Payment Received') {
      // Check if order has custom cake items
      const hasCustomCake = order.items?.some(item => item.customRequestId);
      if (hasCustomCake) {
        return ['Design Confirmed'];
      } else {
        return ['In Preparation'];
      }
    }

    // If current status is in the steps array
    if (currentIndex >= 0) {
      // Check if next step should be delivery-specific
      const nextIndex = currentIndex + 1;
      if (nextIndex < orderSteps.length) {
        let nextStep = orderSteps[nextIndex];
        
        // Skip "Design Confirmed" if order doesn't have custom cakes
        const hasCustomCake = order.items?.some(item => item.customRequestId);
        if (nextStep === 'Design Confirmed' && !hasCustomCake) {
          // Skip to next step
          if (nextIndex + 1 < orderSteps.length) {
            nextStep = orderSteps[nextIndex + 1];
          } else {
            return [];
          }
        }
        
        // Replace 'Ready for Pickup' with 'Out for Delivery' if delivery mode
        if (nextStep === 'Ready for Pickup' && order.delivery?.mode === 'delivery') {
          nextStep = 'Out for Delivery';
        }
        return [nextStep];
      }
    }

    // If status not found in steps, check timeline to determine next step
    const timelineSteps = order.timeline?.map(t => t.step) || [];
    const lastTimelineStep = timelineSteps[timelineSteps.length - 1];
    
    // Find what comes after the last timeline step
    if (lastTimelineStep === 'Payment Received') {
      // Check if order has custom cake items
      const hasCustomCake = order.items?.some(item => item.customRequestId);
      if (hasCustomCake) {
        return ['Design Confirmed'];
      } else {
        return ['In Preparation'];
      }
    }
    if (lastTimelineStep === 'Design Confirmed') {
      return ['In Preparation'];
    }
    if (lastTimelineStep === 'In Preparation') {
      return order.delivery?.mode === 'delivery' 
        ? ['Out for Delivery'] 
        : ['Ready for Pickup'];
    }
    if (lastTimelineStep === 'Ready for Pickup' || lastTimelineStep === 'Out for Delivery') {
      return ['Completed'];
    }

    // Default: if awaiting payment, next is Payment Received
    if (currentStatus === 'Awaiting e-Transfer') {
      return ['Payment Received'];
    }

    return [];
  };

  useEffect(() => {
    fetchOrders(true); // Initial load with loading state
    // Auto-refresh orders every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrders(false); // Refresh without loading state
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (error) {
      if (showLoading) {
        toast.error('Failed to fetch orders');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, orderNumber, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderNumber} updated to: ${newStatus}`);
      fetchOrders(false); // Refresh without loading
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const markPaymentReceived = async (orderId, orderNumber, note = '') => {
    try {
      await api.put(`/orders/${orderId}/status`, { 
        status: 'Payment Received',
        note: note || `Payment manually confirmed by admin`
      });
      toast.success(`Payment received for Order #${orderNumber}! ✅`);
      fetchOrders(false); // Refresh without loading
    } catch (error) {
      toast.error('Failed to mark payment as received');
    }
  };

  // Search orders for manual payment matching
  const searchOrdersForPayment = async () => {
    setSearchLoading(true);
    try {
      let matchingOrders = orders.filter(order => {
        const matchesName = !paymentSearch.customerName || 
          order.customerInfo.name?.toLowerCase().includes(paymentSearch.customerName.toLowerCase());
        const matchesEmail = !paymentSearch.customerEmail || 
          order.customerInfo.email?.toLowerCase().includes(paymentSearch.customerEmail.toLowerCase());
        const matchesAmount = !paymentSearch.amount || 
          Math.abs(order.total - parseFloat(paymentSearch.amount)) < 0.01;
        const matchesDate = !paymentSearch.date || 
          new Date(order.createdAt).toDateString() === new Date(paymentSearch.date).toDateString();
        
        return matchesName && matchesEmail && matchesAmount && matchesDate &&
               order.payment.state === 'awaiting';
      });

      setSearchResults(matchingOrders.slice(0, 10)); // Limit to 10 results
      if (matchingOrders.length === 0) {
        toast.warning('No matching orders found. Try adjusting your search criteria.');
      }
    } catch (error) {
      toast.error('Failed to search orders');
    } finally {
      setSearchLoading(false);
    }
  };

  const openPaymentMatchModal = () => {
    setPaymentMatchModal({ open: true });
    setPaymentSearch({ customerName: '', customerEmail: '', amount: '', date: '' });
    setSearchResults([]);
  };

  const closePaymentMatchModal = () => {
    setPaymentMatchModal({ open: false });
    setPaymentSearch({ customerName: '', customerEmail: '', amount: '', date: '' });
    setSearchResults([]);
  };

  // Separate orders into active and cancelled
  const activeOrders = orders.filter(order => order.status !== 'Cancelled');
  const cancelledOrders = orders.filter(order => order.status === 'Cancelled');

  const filterActiveOrders = (orderList) => {
    return orderList.filter(order => {
      if (filter === 'pending') return order.payment.state === 'awaiting';
      if (filter === 'completed') return order.status === 'Completed';
      if (filter === 'active') return order.status !== 'Completed' && order.status !== 'Cancelled';
      return true;
    }).filter(order =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredActiveOrders = filterActiveOrders(activeOrders);
  const filteredCancelledOrders = cancelledOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
    order.customerInfo.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (window.confirm(`Are you sure you want to cancel Order #${orderNumber}?`)) {
      try {
        await api.put(`/orders/${orderId}/status`, { status: 'Cancelled' });
        toast.success(`Order #${orderNumber} has been cancelled`);
        fetchOrders(false);
      } catch (error) {
        toast.error('Failed to cancel order');
      }
    }
  };

  // Fetch design images from custom request
  const viewDesign = async (order) => {
    try {
      // Find if order has custom request items
      const customRequestItem = order.items?.find(item => item.customRequestId);
      
      if (!customRequestItem?.customRequestId) {
        toast.warning('No design images found for this order');
        return;
      }

      // Check if custom request is already populated
      let customRequest;
      if (customRequestItem.customRequestId && customRequestItem.customRequestId.referenceImages) {
        // Already populated
        customRequest = customRequestItem.customRequestId;
      } else {
        // Need to fetch
        const customRequestId = typeof customRequestItem.customRequestId === 'string' 
          ? customRequestItem.customRequestId 
          : customRequestItem.customRequestId._id || customRequestItem.customRequestId;
        
        const response = await api.get(`/custom-requests/${customRequestId}`);
        customRequest = response.data.data;
      }
      
      if (!customRequest.referenceImages || customRequest.referenceImages.length === 0) {
        toast.warning('No design images uploaded for this order');
        return;
      }

      // Open modal with images
      setDesignViewModal({
        open: true,
        order: order,
        images: customRequest.referenceImages,
        customRequest: customRequest
      });
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Error fetching design images:', error);
      toast.error('Failed to load design images');
    }
  };

  const confirmDesign = async () => {
    if (!designViewModal.order) return;
    
    try {
      await api.put(`/orders/${designViewModal.order._id}/status`, { 
        status: 'Design Confirmed' 
      });
      toast.success(`Design confirmed for Order #${designViewModal.order.orderNumber}! ✨`);
      setDesignViewModal({ open: false, order: null, images: [] });
      fetchOrders(false);
    } catch (error) {
      toast.error('Failed to confirm design');
    }
  };

  const closeDesignModal = () => {
    setDesignViewModal({ open: false, order: null, images: [] });
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < designViewModal.images.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : designViewModal.images.length - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Manage Orders</h1>
          <p className="text-gray-600">
            {activeOrders.length} active orders
            {cancelledOrders.length > 0 && ` • ${cancelledOrders.length} cancelled orders`}
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order #, customer name or email..."
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
                <option value="all">All Active Orders</option>
                <option value="pending">Pending Payment</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          {/* Manual Payment Matching Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={openPaymentMatchModal}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center space-x-2"
            >
              <FaSearch />
              <span>Find Order for Payment (Manual Match)</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center md:text-left">
              Use this if customer forgot order number or entered wrong number in payment message
            </p>
          </div>
        </div>

        {/* Active Orders Table */}
        <div className="card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Current Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Next Step</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredActiveOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No active orders found
                    </td>
                  </tr>
                ) : (
                  filteredActiveOrders.map((order) => {
                    const nextSteps = getNextSteps(order);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-primary-600 hover:underline font-mono font-semibold"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customerInfo.name}</p>
                            <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
                            <p className="text-xs text-gray-400">{order.customerInfo.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            order.payment.state === 'received'
                              ? 'bg-green-100 text-green-800'
                              : order.payment.state === 'awaiting'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.payment.state}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full font-semibold ${getOrderStatusColor(order.status)}`}>
                            {order.status === 'Payment Received' && <FaCheck className="mr-1" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {nextSteps.length > 0 ? (
                            <div className="flex flex-col space-y-2">
                              {nextSteps.map((step, idx) => {
                                // Check if this order has custom request and next step is Design Confirmed
                                const hasCustomRequest = order.items?.some(item => item.customRequestId);
                                const isDesignStep = step === 'Design Confirmed';
                                
                                if (hasCustomRequest && isDesignStep) {
                                  // Show "View Design" button first, then confirm option in modal
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => viewDesign(order)}
                                      className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-1"
                                    >
                                      <FaImage className="text-xs" />
                                      <span>View Design</span>
                                    </button>
                                  );
                                }
                                
                                // Regular step button
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => updateOrderStatus(order._id, order.orderNumber, step)}
                                    className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center space-x-1"
                                  >
                                    <FaCheck className="text-xs" />
                                    <span>{step}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No next step</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            {order.payment.state === 'awaiting' && (
                              <>
                                <button
                                  onClick={() => markPaymentReceived(order._id, order.orderNumber)}
                                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  Mark Paid
                                </button>
                              </>
                            )}
                            <Link
                              to={`/orders/${order._id}`}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-1"
                            >
                              <FaEye />
                              <span>View</span>
                            </Link>
                            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-1"
                              >
                                <FaTimes />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancelled Orders Section */}
        {filteredCancelledOrders.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b bg-red-50">
              <h2 className="text-xl font-semibold text-red-900 flex items-center space-x-2">
                <FaTimes />
                <span>Cancelled Orders ({filteredCancelledOrders.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCancelledOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors opacity-75">
                      <td className="px-6 py-4">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-red-600 hover:underline font-mono font-semibold"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerInfo.name}</p>
                          <p className="text-sm text-gray-500">{order.customerInfo.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          order.payment.state === 'received'
                            ? 'bg-green-100 text-green-800'
                            : order.payment.state === 'awaiting'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.payment.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-1"
                        >
                          <FaEye />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Design View Modal */}
        <AnimatePresence>
          {designViewModal.open && designViewModal.images.length > 0 && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDesignModal}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-4 z-[10001] flex items-center justify-center pointer-events-none"
              >
                <div 
                  className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-gray-900">
                        View Design - Order #{designViewModal.order?.orderNumber}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {designViewModal.customRequest?.customerName} • {designViewModal.images.length} image(s)
                      </p>
                    </div>
                    <button
                      onClick={closeDesignModal}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  {/* Image Gallery */}
                  <div className="flex-1 relative bg-gray-900 flex items-center justify-center min-h-[500px]">
                    <AnimatePresence mode="wait">
                      {designViewModal.images.map((image, index) => 
                        index === currentImageIndex ? (
                          <motion.div
                            key={image.url || index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center p-8"
                          >
                            <img
                              src={image.url.startsWith('http') ? image.url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${image.url}`}
                              alt={`Design reference ${index + 1}`}
                              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                              }}
                            />
                          </motion.div>
                        ) : null
                      )}
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {designViewModal.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft className="text-xl" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                          aria-label="Next image"
                        >
                          <FaChevronRight className="text-xl" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {designViewModal.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {designViewModal.images.length}
                      </div>
                    )}

                    {/* Thumbnail Strip */}
                    {designViewModal.images.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                          {designViewModal.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentImageIndex
                                  ? 'border-white scale-110'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={image.url.startsWith('http') ? image.url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${image.url}`}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Design Details */}
                  {designViewModal.customRequest && (
                    <div className="p-6 bg-gray-50 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Flavor</p>
                          <p className="font-medium text-sm">{designViewModal.customRequest.flavor}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Size</p>
                          <p className="font-medium text-sm">{designViewModal.customRequest.size}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Layers</p>
                          <p className="font-medium text-sm">{designViewModal.customRequest.layers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Shape</p>
                          <p className="font-medium text-sm">{designViewModal.customRequest.shape || 'Round'}</p>
                        </div>
                      </div>
                      {designViewModal.customRequest.messageOnCake && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Message on Cake</p>
                          <p className="font-medium text-primary-600">"{designViewModal.customRequest.messageOnCake}"</p>
                        </div>
                      )}
                      {designViewModal.customRequest.theme && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Theme</p>
                          <p className="font-medium">{designViewModal.customRequest.theme}</p>
                        </div>
                      )}
                      {designViewModal.customRequest.notes && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
                          <p className="text-sm text-gray-700">{designViewModal.customRequest.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-6 border-t bg-white flex items-center justify-between">
                    <button
                      onClick={closeDesignModal}
                      className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={closeDesignModal}
                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDesign}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center space-x-2"
                      >
                        <FaCheck />
                        <span>Confirm Design</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Manual Payment Matching Modal */}
        <AnimatePresence>
          {paymentMatchModal.open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closePaymentMatchModal}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-4 z-[10001] flex items-center justify-center pointer-events-none"
              >
                <div 
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-gray-900">
                        Manual Payment Matching
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Find order when customer forgot order number or entered wrong number
                      </p>
                    </div>
                    <button
                      onClick={closePaymentMatchModal}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  {/* Search Form */}
                  <div className="p-6 bg-gray-50 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={paymentSearch.customerName}
                          onChange={(e) => setPaymentSearch({ ...paymentSearch, customerName: e.target.value })}
                          placeholder="e.g., John Doe"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Email
                        </label>
                        <input
                          type="email"
                          value={paymentSearch.customerEmail}
                          onChange={(e) => setPaymentSearch({ ...paymentSearch, customerEmail: e.target.value })}
                          placeholder="e.g., john@example.com"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Amount (CAD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={paymentSearch.amount}
                          onChange={(e) => setPaymentSearch({ ...paymentSearch, amount: e.target.value })}
                          placeholder="e.g., 62.14"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Date
                        </label>
                        <input
                          type="date"
                          value={paymentSearch.date}
                          onChange={(e) => setPaymentSearch({ ...paymentSearch, date: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <button
                      onClick={searchOrdersForPayment}
                      disabled={searchLoading}
                      className="w-full bg-gradient-to-r from-primary-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <FaSearch />
                      <span>{searchLoading ? 'Searching...' : 'Search Orders'}</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Tip: Use at least 2 search criteria (e.g., name + amount) for best results
                    </p>
                  </div>

                  {/* Search Results */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {searchResults.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Matching Orders ({searchResults.length})
                        </h3>
                        {searchResults.map((order) => (
                          <div key={order._id} className="card p-5 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-bold text-gray-900">
                                    Order #{order.orderNumber}
                                  </h4>
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                    Payment Pending
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500 text-xs">Customer</p>
                                    <p className="font-medium">{order.customerInfo.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Email</p>
                                    <p className="font-medium text-xs break-all">{order.customerInfo.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Amount</p>
                                    <p className="font-bold text-primary-600">{formatPrice(order.total)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">Order Date</p>
                                    <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-2">Order Items:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {item.title} {item.selectedSize && `(${item.selectedSize})`} x{item.quantity}
                                      </span>
                                    ))}
                                    {order.items.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{order.items.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                              <Link
                                to={`/orders/${order._id}`}
                                className="flex-1 btn-outline text-center"
                              >
                                <FaEye className="inline mr-2" />
                                View Order Details
                              </Link>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Confirm payment received for Order #${order.orderNumber}?\n\nThis will mark the payment as received even though the order number wasn't in the payment message.`)) {
                                    markPaymentReceived(order._id, order.orderNumber, 'Payment manually matched - order number missing/incorrect in payment message');
                                    closePaymentMatchModal();
                                  }
                                }}
                                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                              >
                                ✓ Match & Mark Paid
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : paymentSearch.customerName || paymentSearch.customerEmail || paymentSearch.amount || paymentSearch.date ? (
                      <div className="text-center py-12">
                        <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No matching orders found</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Try adjusting your search criteria or check if payment was already processed
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
                          <h3 className="font-semibold text-gray-900 mb-3">How to Use Manual Payment Matching</h3>
                          <ol className="text-sm text-gray-700 text-left space-y-2 list-decimal list-inside">
                            <li>Enter customer name and/or email from the payment message</li>
                            <li>Enter the payment amount (if available)</li>
                            <li>Optionally select the order date</li>
                            <li>Click "Search Orders" to find matching pending orders</li>
                            <li>Review the results and click "Match & Mark Paid"</li>
                          </ol>
                          <p className="text-xs text-gray-500 mt-4 italic">
                            Use this when customer forgot to include order number or entered wrong number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Orders;

