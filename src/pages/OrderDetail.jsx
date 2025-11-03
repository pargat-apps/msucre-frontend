import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';
import OrderTimeline from '../components/OrderTimeline';
import Loading from '../components/Loading';
import { formatPrice, formatDateTime } from '../utils/helpers';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder(true); // Initial load with loading state
    // Auto-refresh order status every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrder(false); // Refresh without loading state
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loading fullScreen />;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  const showETransferInstructions = order.payment.state === 'awaiting';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/my-orders" className="btn-outline">
                View All Orders
              </Link>
            </div>
          </div>
        </div>

        {/* E-Transfer Instructions */}
        {showETransferInstructions && (
          <div className="card p-6 mb-8 border-2 border-primary-500 bg-primary-50">
            <div className="flex items-start space-x-3 mb-4">
              <FaCheckCircle className="text-primary-600 text-2xl flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  ⚠️ Payment Required
                </h2>
                <p className="text-gray-700 mb-4">
                  Please send an Interac e-Transfer to complete your order. Your order will begin processing once we receive your payment.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Send
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-3xl font-bold text-primary-600">
                    {formatPrice(order.total)} CAD
                  </span>
                  <button
                    onClick={() => copyToClipboard(order.total.toFixed(2))}
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    {copied ? <span>✓ Copied</span> : <><FaCopy className="inline mr-2" />Copy</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg font-mono">{order.payment.recipientEmail}</span>
                  <button
                    onClick={() => copyToClipboard(order.payment.recipientEmail)}
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    <FaCopy className="inline mr-2" />Copy
                  </button>
                </div>
              </div>

              {/* Critical Payment Instructions - Compact but Prominent */}
              <div className="mt-8">
                <div className="relative">
                  {/* Compact header banner - positioned to be fully visible */}
                  <div className="flex justify-center mb-0">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-1.5 rounded-t-lg shadow-md z-10 relative">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="font-semibold text-xs uppercase tracking-wider">Critical Payment Step</span>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Main content box - more compact */}
                  <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 rounded-b-xl rounded-t-none p-5 shadow-lg -mt-px">
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200/10 via-transparent to-orange-200/10 rounded-xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      {/* Compact label */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center space-x-2">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          <span>Payment Message Required</span>
                        </h3>
                            <p className="text-xs font-medium text-amber-800">Copy the order number and paste it in your bank's message field</p>
                      </div>

                      {/* Order Number Display - Smaller but still prominent */}
                      <div className="bg-white rounded-lg p-4 border-2 border-amber-300 shadow-sm mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Order Number</p>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-3xl font-black text-gray-900 tracking-tight">
                                {order.orderNumber}
                              </span>
                              <span className="text-sm font-semibold text-gray-600">Order #</span>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(order.orderNumber)}
                            className="flex-shrink-0 bg-gradient-to-r from-primary-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-primary-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
                          >
                            <FaCopy className="text-sm" />
                            <span className="text-sm">Copy</span>
                          </button>
                        </div>
                      </div>

                      {/* Warning Message - Compact */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-red-900 text-sm mb-1">This Step is Required</p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              Your payment cannot be processed without the order number in the message field.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-blue-900 mb-2">How to Send Interac e-Transfer:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Log into your online banking or mobile banking app</li>
                  <li>Select "Interac e-Transfer" or "Send Money"</li>
                  <li>Enter the recipient email: {order.payment.recipientEmail}</li>
                  <li>Enter the amount: ${order.total.toFixed(2)}</li>
                  <li className="font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded -ml-2">
                    In the message field, enter: <span className="font-mono">{order.orderNumber}</span>
                  </li>
                  <li>Complete the transfer</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Order Paid Confirmation */}
        {order.payment.state === 'received' && (
          <div className="card p-6 mb-8 border-2 border-green-500 bg-green-50">
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-green-600 text-3xl" />
              <div>
                <h2 className="text-xl font-semibold text-green-900">Payment Received!</h2>
                <p className="text-green-700">
                  We've received your payment on {formatDateTime(order.payment.paidAt)}. 
                  Your order is now being prepared.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <OrderTimeline order={order} />
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Items */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between text-sm text-green-600">
                    <span>{discount.type} discount</span>
                    <span>-{formatPrice(discount.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.shippingFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Method:</span> {order.delivery.mode === 'pickup' ? 'Pickup' : 'Delivery'}
                </div>
                {order.delivery.mode === 'delivery' && order.delivery.address && (
                  <div>
                    <span className="font-medium">Address:</span>
                    <p className="text-gray-600">
                      {order.delivery.address.street}<br />
                      {order.delivery.address.city}, {order.delivery.address.province}<br />
                      {order.delivery.address.postalCode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {order.customerInfo.name}</div>
                <div><span className="font-medium">Email:</span> {order.customerInfo.email}</div>
                <div><span className="font-medium">Phone:</span> {order.customerInfo.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

