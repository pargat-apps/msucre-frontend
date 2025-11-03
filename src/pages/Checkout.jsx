import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCreditCard, FaTruck, FaStore } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { formatPrice, calculateDiscount } from '../utils/helpers';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [registrationDiscount, setRegistrationDiscount] = useState(null);
  const [formData, setFormData] = useState({
    customerInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    },
    delivery: {
      mode: 'pickup',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: ''
      },
      instructions: ''
    }
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
    if (isAuthenticated && !user?.firstOrderDiscountUsed) {
      fetchRegistrationDiscount();
    }
  }, [cart, navigate, isAuthenticated, user]);

  const fetchRegistrationDiscount = async () => {
    try {
      const response = await api.get('/offers/registration');
      if (response.data.data) {
        setRegistrationDiscount(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching registration discount:', error);
    }
  };

  const applyPromoCode = async () => {
    try {
      const response = await api.post('/offers/validate', { code: promoCode });
      setAppliedPromo(response.data.data);
      toast.success(response.data.message || `${response.data.data.percentOff}% discount applied!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid promo code. Please check and try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare delivery data - don't send empty address for pickup
      const deliveryData = {
        mode: formData.delivery.mode,
        instructions: formData.delivery.instructions || ''
      };

      // Only include address if delivery mode AND address has values
      if (formData.delivery.mode === 'delivery' && formData.delivery.address) {
        const addr = formData.delivery.address;
        if (addr.street || addr.city || addr.province || addr.postalCode) {
          deliveryData.address = {
            street: addr.street || '',
            city: addr.city || '',
            province: addr.province || '',
            postalCode: addr.postalCode || ''
          };
        }
      }

      const orderData = {
        items: cart,
        customerInfo: formData.customerInfo,
        delivery: deliveryData
      };

      // Only include promoCode if it has a value
      if (appliedPromo?.code) {
        orderData.promoCode = appliedPromo.code;
      }

      console.log('Submitting order:', orderData); // Debug log

      const response = await api.post('/orders', orderData);
      const order = response.data.data;
      
      toast.success(`Order placed successfully! Order #${order.orderNumber}`, 3000);
      
      clearCart();
      
      // Slight delay to show success message before navigating
      setTimeout(() => {
        navigate(`/orders/${order._id}`);
      }, 1000);
    } catch (error) {
      console.error('Order error:', error.response?.data); // Debug log
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.map(e => e.message).join(', ') ||
                          'Failed to create order. Please check all required fields.';
      toast.error(errorMessage, 6000);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const registrationDiscountAmount = registrationDiscount ? calculateDiscount(subtotal, registrationDiscount.percentOff) : 0;
  const promoDiscountAmount = appliedPromo ? calculateDiscount(subtotal, appliedPromo.percentOff) : 0;
  const totalDiscounts = registrationDiscountAmount + promoDiscountAmount;
  const taxableAmount = subtotal - totalDiscounts;
  const tax = taxableAmount * 0.13;
  const shippingFee = formData.delivery.mode === 'delivery' ? 10 : 0;
  const total = taxableAmount + tax + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.customerInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, name: e.target.value }
                      })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.customerInfo.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, email: e.target.value }
                      })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.customerInfo.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, phone: e.target.value }
                      })}
                      required
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, mode: 'pickup' }
                    })}
                    className={`p-4 border-2 rounded-lg text-center ${
                      formData.delivery.mode === 'pickup'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <FaStore className="text-3xl mx-auto mb-2" />
                    <p className="font-semibold">Pickup</p>
                    <p className="text-sm text-gray-600">Free</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      delivery: { ...formData.delivery, mode: 'delivery' }
                    })}
                    className={`p-4 border-2 rounded-lg text-center ${
                      formData.delivery.mode === 'delivery'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <FaTruck className="text-3xl mx-auto mb-2" />
                    <p className="font-semibold">Delivery</p>
                    <p className="text-sm text-gray-600">$10.00</p>
                  </button>
                </div>

                {formData.delivery.mode === 'delivery' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        onChange={(e) => setFormData({
                          ...formData,
                          delivery: {
                            ...formData.delivery,
                            address: { 
                              ...formData.delivery.address, 
                              street: e.target.value 
                            }
                          }
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input 
                          type="text" 
                          required 
                          className="input-field"
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery: {
                              ...formData.delivery,
                              address: { 
                                ...formData.delivery.address, 
                                city: e.target.value 
                              }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                        <input 
                          type="text" 
                          required 
                          className="input-field"
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery: {
                              ...formData.delivery,
                              address: { 
                                ...formData.delivery.address, 
                                postalCode: e.target.value 
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                        <select 
                          required 
                          className="input-field"
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery: {
                              ...formData.delivery,
                              address: { 
                                ...formData.delivery.address, 
                                province: e.target.value 
                              }
                            }
                          })}
                        >
                          <option value="">Select Province</option>
                          <option value="ON">Ontario</option>
                          <option value="QC">Quebec</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Promo Code</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-green-600 text-sm mt-2">✓ {appliedPromo.name} applied!</p>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.title} x{item.quantity}</span>
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {registrationDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Registration Discount ({registrationDiscount.percentOff}%)</span>
                      <span>-{formatPrice(registrationDiscountAmount)}</span>
                    </div>
                  )}
                  
                  {promoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount ({appliedPromo.percentOff}%)</span>
                      <span>-{formatPrice(promoDiscountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (HST 13%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  {shippingFee > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(shippingFee)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <FaCreditCard className="text-blue-600 mt-1" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">Payment Method</p>
                      <p className="text-blue-700">Interac e-Transfer</p>
                      <p className="text-blue-600 text-xs mt-1">
                        You'll receive payment instructions after placing your order
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-yellow-900 font-medium mb-2">
                    ⚠️ Important Order Requirements:
                  </p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• Orders must be placed at least 6 days in advance</li>
                    <li>• 50% non-refundable deposit required to confirm order</li>
                    <li>• Remaining balance due before delivery/pickup</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our{' '}
                  <Link to="/terms" className="text-primary-600 hover:underline font-semibold">
                    Terms and Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

