import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('cart.empty')}</h2>
          <p className="text-gray-600 mb-8">{t('cart.emptyDesc')}</p>
          <Link to="/catalog" className="btn-primary">
            {t('home.browseCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">{t('cart.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="card p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || '/placeholder-cake.jpg'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title || item.name}</h3>
                    {item.isCombo && (
                      <p className="text-xs text-primary-600 font-medium mt-1">🎁 Combo Deal</p>
                    )}
                    {item.selectedSize && (
                      <p className="text-sm text-gray-600">{item.selectedSize}</p>
                    )}
                    <p className="text-primary-600 font-semibold mt-1">
                      {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border border-gray-300 rounded">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.orderSummary')}</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 mb-2">{t('cart.loginRequired')}</p>
                  <div className="flex space-x-2">
                    <Link to="/login" className="text-sm text-primary-600 hover:underline font-semibold">
                      {t('cart.loginNow')}
                    </Link>
                    <span className="text-sm text-gray-500">or</span>
                    <Link to="/register" className="text-sm text-primary-600 hover:underline font-semibold">
                      Register
                    </Link>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/register');
                    return;
                  }
                  navigate('/checkout');
                }}
                className="btn-primary w-full mb-4"
              >
                {isAuthenticated ? t('cart.checkout') : 'Login to Checkout'}
              </button>

              <Link to="/catalog" className="block text-center text-primary-600 hover:underline">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

