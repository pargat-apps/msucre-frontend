import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaEye, FaCalendarAlt, FaDollarSign, FaTag } from 'react-icons/fa';
import api from '../utils/api';
import { formatPrice, formatDateTime, getOrderStatusColor } from '../utils/helpers';
import Loading from '../components/Loading';
import { useToast } from '../components/Toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 15 seconds to show real-time status updates
    const interval = setInterval(() => {
      fetchOrders(false); // Don't show loading on refresh
    }, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const endpoint = filter === 'all' ? '/orders' : `/orders?status=${filter}`;
      const response = await api.get(endpoint);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (showLoading) {
        toast.error('Failed to load orders. Please try again.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const color = getOrderStatusColor(status);
    return `px-3 py-1 rounded-full text-xs font-semibold ${color}`;
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and track your order history</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'Awaiting e-Transfer', 'Payment Received', 'In Preparation', 'Ready for Pickup', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status === 'all' ? 'all' : status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === (status === 'all' ? 'all' : status)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="card p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping!</p>
            <Link to="/catalog" className="btn-primary inline-flex items-center space-x-2">
              <FaBox />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Left Section */}
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <FaBox className="text-primary-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber || order._id.slice(-8)}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <FaCalendarAlt />
                          <span>{formatDateTime(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="ml-16 mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{order.items?.length || 0} item(s)</span>
                      </p>
                      <div className="space-y-1">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            • {item.title} {item.selectedSize && `(${item.selectedSize})`} x {item.quantity}
                          </p>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-sm text-gray-500">
                            + {order.items.length - 3} more item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col md:items-end space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                {order.delivery && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Delivery:</span> {order.delivery.mode === 'pickup' ? 'Pickup' : 'Delivery'}
                      {order.delivery.address && order.delivery.mode === 'delivery' && (
                        <span className="ml-2">
                          • {order.delivery.address.city}, {order.delivery.address.province}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

