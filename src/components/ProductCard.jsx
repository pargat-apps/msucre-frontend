import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { saveRedirectUrl } from '../utils/redirect';
import { useTranslation } from '../hooks/useTranslation';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save current product page URL for redirect after login/registration
      saveRedirectUrl(`/products/${product.slug}`);
      
      // Show message and redirect to registration
      toast.error(t('cart.loginRequired'), 3000);
      setTimeout(() => {
        navigate('/register');
      }, 1000);
      return;
    }

    // User is authenticated, proceed with adding to cart
    addToCart({
      productId: product._id,
      title: product.title,
      unitPrice: product.price,
      image: product.images[0]?.url,
      quantity: 1
    });
    toast.success(`${product.title} added to cart!`, 2000);
  };

  return (
    <Link to={`/products/${product.slug}`} className="card group hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={product.images[0]?.url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&q=80'}
          alt={product.images[0]?.alt || product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&q=80';
          }}
        />
        {product.isBestseller && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t('product.bestseller')}
          </span>
        )}
        {product.sampleEligible && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t('product.sampleAvailable')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* Flavor */}
        {product.flavor && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {product.flavor}
            </span>
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="btn-primary py-2 px-4 text-sm"
          >
            {t('product.addToCart')}
          </button>
        </div>

        {/* Lead time */}
        {product.leadTimeDays > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            🕐 {product.leadTimeDays} {product.leadTimeDays > 1 ? t('product.days') : t('product.days')} {t('product.leadTime')}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

