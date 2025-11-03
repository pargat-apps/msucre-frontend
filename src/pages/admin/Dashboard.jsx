import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaShoppingBag, 
  FaTags, 
  FaUsers, 
  FaStar, 
  FaChartLine,
  FaDollarSign,
  FaClock,
  FaArrowUp,
  FaCalendarAlt
} from 'react-icons/fa';
import api from '../../utils/api';
import { formatPrice, getOrderStatusColor, formatDateTime } from '../../utils/helpers';
import { useToast } from '../../components/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingReviews: 0,
    customRequests: 0,
    todayOrders: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [revenueByWeek, setRevenueByWeek] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData(true); // Initial load with loading state
    // Auto-refresh dashboard data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData(false); // Refresh without loading state
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [ordersRes, productsRes, reviewsRes, customReqRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/reviews/admin/pending'),
        api.get('/custom-requests')
      ]);

      const orders = ordersRes.data.data;
      const products = productsRes.data.data;

      // Calculate stats
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      const completedOrders = orders.filter(o => o.status === 'Completed');
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);

      // This week's revenue
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);

      // This month's revenue
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthAgo);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

      // Orders by status
      const statusCounts = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      // Revenue by week (last 4 weeks)
      const weeklyRevenue = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        
        const weekOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= weekStart && orderDate < weekEnd;
        });
        
        weeklyRevenue.push({
          week: `Week ${4 - i}`,
          revenue: weekOrders.reduce((sum, o) => sum + o.total, 0),
          orders: weekOrders.length
        });
      }

      // Top products (by order frequency)
      const productCounts = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId) {
            const id = item.productId._id || item.productId;
            productCounts[id] = (productCounts[id] || 0) + item.quantity;
          }
        });
      });

      const topProds = products
        .map(p => ({
          ...p,
          orderCount: productCounts[p._id] || 0
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      setStats({
        totalOrders: orders.length,
        pendingPayment: orders.filter(o => o.payment.state === 'awaiting').length,
        completedOrders: completedOrders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: new Set(orders.map(o => o.userId).filter(Boolean)).size,
        pendingReviews: reviewsRes.data.count || 0,
        customRequests: customReqRes.data.count || 0,
        todayOrders: todayOrders.length,
        weekRevenue,
        monthRevenue,
        averageOrderValue: avgOrderValue
      });

      setRecentOrders(orders.slice(0, 10));
      setOrdersByStatus(statusCounts);
      setRevenueByWeek(weeklyRevenue);
      setTopProducts(topProds);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to: ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const markPaymentReceived = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'Payment Received' });
      toast.success('Payment marked as received! ✅');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to mark payment as received');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with M. Sucre today.</p>
        </div>

        {/* Top Stats - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <FaDollarSign className="text-5xl text-blue-500 opacity-20" />
            </div>
            <div className="flex items-center text-sm text-green-600">
              <FaArrowUp className="mr-1" />
              <span>+{formatPrice(stats.weekRevenue)} this week</span>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.completedOrders} completed</p>
              </div>
              <FaShoppingBag className="text-5xl text-green-500 opacity-20" />
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <FaCalendarAlt className="mr-1" />
              <span>{stats.todayOrders} today</span>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payment</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayment}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting e-Transfer</p>
              </div>
              <FaClock className="text-5xl text-yellow-500 opacity-20 animate-pulse" />
            </div>
            <Link to="/admin/orders" className="text-sm text-yellow-600 hover:underline">
              View pending →
            </Link>
          </div>

          <div className="card p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">{formatPrice(stats.averageOrderValue)}</p>
                <p className="text-xs text-gray-500 mt-1">Per order</p>
              </div>
              <FaChartLine className="text-5xl text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Week Chart */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaChartLine className="text-primary-600 mr-2" />
              Revenue Trend (Last 4 Weeks)
            </h2>
            <div className="space-y-4">
              {revenueByWeek.map((week, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{week.week}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary-600">{formatPrice(week.revenue)}</span>
                      <span className="text-xs text-gray-500 ml-2">({week.orders} orders)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${week.revenue > 0 ? (week.revenue / stats.totalRevenue) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaShoppingBag className="text-blue-600 mr-2" />
              Orders by Status
            </h2>
            <div className="space-y-4">
              {Object.entries(ordersByStatus).map(([status, count]) => {
                const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getOrderStatusColor(status)}`}>
                        {status}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{count} orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center hover:shadow-xl transition-shadow">
            <FaUsers className="text-4xl text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
            <p className="text-xs text-gray-500 mt-1">Unique customers</p>
          </div>

          <div className="card p-6 text-center hover:shadow-xl transition-shadow">
            <FaBox className="text-4xl text-primary-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
              Manage →
            </Link>
          </div>

          <div className="card p-6 text-center hover:shadow-xl transition-shadow">
            <FaStar className="text-4xl text-yellow-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
            <Link to="/admin/reviews" className="text-xs text-yellow-600 hover:underline mt-1 inline-block">
              Moderate →
            </Link>
          </div>

          <div className="card p-6 text-center hover:shadow-xl transition-shadow">
            <FaTags className="text-4xl text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Custom Requests</p>
            <p className="text-3xl font-bold text-gray-900">{stats.customRequests}</p>
            <Link to="/admin/custom-requests" className="text-xs text-purple-600 hover:underline mt-1 inline-block">
              Review →
            </Link>
          </div>
        </div>

        {/* Top Products & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Selling Products */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaChartLine className="text-green-600 mr-2" />
              Top Selling Products
            </h2>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <Link
                    key={product._id}
                    to={product.slug ? `/products/${product.slug}` : '#'}
                    className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={product.images[0]?.url}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=Cake';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{product.title}</p>
                      <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600">{product.orderCount}</p>
                      <p className="text-xs text-gray-500">sold</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet to show top products</p>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaDollarSign className="text-green-600 mr-2" />
              Revenue Breakdown
            </h2>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">This Month</span>
                  <span className="text-2xl font-bold text-green-600">{formatPrice(stats.monthRevenue)}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.totalRevenue > 0 ? (stats.monthRevenue / stats.totalRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">This Week</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(stats.weekRevenue)}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.totalRevenue > 0 ? (stats.weekRevenue / stats.totalRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Average Order Value</span>
                  <span className="text-2xl font-bold text-purple-600">{formatPrice(stats.averageOrderValue)}</span>
                </div>
                <p className="text-xs text-gray-600">Based on {stats.totalOrders} orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <FaShoppingBag className="text-primary-600 mr-2" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-primary-600 hover:underline text-sm font-medium">
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start placing them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link 
                          to={`/orders/${order._id}`} 
                          className="text-primary-600 hover:underline font-mono font-semibold"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerInfo.name}</p>
                          <p className="text-xs text-gray-500">{order.customerInfo.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          order.payment.state === 'received' 
                            ? 'bg-green-100 text-green-800' 
                            : order.payment.state === 'awaiting'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.payment.state}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {order.payment.state === 'awaiting' && (
                          <button
                            onClick={() => markPaymentReceived(order._id)}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/hero" className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-2xl text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hero Section</p>
                  <p className="text-xs text-gray-500">Edit homepage hero</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/products" className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaBox className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Products</p>
                  <p className="text-xs text-gray-500">{stats.totalProducts} products</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/orders" className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaShoppingBag className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Orders</p>
                  <p className="text-xs text-gray-500">{stats.pendingPayment} pending</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/reviews" className="card p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaStar className="text-2xl text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Reviews</p>
                  <p className="text-xs text-gray-500">{stats.pendingReviews} pending</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
