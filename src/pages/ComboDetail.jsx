import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTag, FaGift, FaClock } from 'react-icons/fa';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { useTranslation } from '../hooks/useTranslation';
import Loading from '../components/Loading';

const ComboDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombo();
    const interval = setInterval(() => {
      fetchCombo(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchCombo = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/combos/${id}`);
      setCombo(response.data.data);
    } catch (error) {
      console.error('Error fetching combo:', error);
      toast.error('Failed to load combo details');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Allow guests to add items to cart (authentication required only at checkout)
    if (!combo.isActive) {
      toast.error('This combo is currently unavailable');
      return;
    }

    addToCart({
      comboId: combo._id,
      name: combo.name,
      unitPrice: combo.price,
      image: combo.images?.[0]?.url,
      quantity: 1,
      isCombo: true
    });

    toast.success(`${combo.name} added to cart!`, 2000);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    if (backendUrl.startsWith('/api')) {
      backendUrl = window.location.origin;
    } else if (!backendUrl.startsWith('http')) {
      backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    }
    
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${backendUrl}${path}`;
  };

  if (loading) return <Loading fullScreen />;
  if (!combo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Combo not found</h2>
          <Link to="/combos" className="btn-primary">View All Combos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/combos" className="text-primary-600 hover:text-primary-800">
            ← Back to Combos
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {combo.images?.[0]?.url ? (
                <img
                  src={getImageUrl(combo.images[0].url)}
                  alt={combo.name}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
                  <FaGift className="text-8xl text-gray-400" />
                </div>
              )}
              {combo.originalPrice && combo.originalPrice > combo.price && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                  {Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center space-x-2 mb-4">
                <FaTag className="text-primary-600" />
                <span className="text-sm text-primary-600 font-semibold">Combo Deal</span>
              </div>

              <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
                {combo.name}
              </h1>

              {combo.shortDescription && (
                <p className="text-xl text-gray-600 mb-6">{combo.shortDescription}</p>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(combo.price)}
                  </span>
                  {combo.originalPrice && combo.originalPrice > combo.price && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(combo.originalPrice)}
                    </span>
                  )}
                </div>
                {combo.originalPrice && combo.originalPrice > combo.price && (
                  <p className="text-sm text-green-600 mt-1 font-semibold">
                    Save {formatPrice(combo.originalPrice - combo.price)}!
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{combo.description}</p>
              </div>

              {/* Items in Combo */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                <div className="space-y-3">
                  {combo.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'cake' ? 'bg-primary-100 text-primary-600' : 'bg-pink-100 text-pink-600'
                        }`}>
                          {item.type === 'cake' ? '🎂' : '🥐'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name || item.productId?.title || 'Product'}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                        </div>
                      </div>
                      <span className="text-gray-700 font-semibold">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="border-t pt-6 space-y-3 mb-6">
                {combo.leadTimeDays > 0 && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaClock />
                    <span>{combo.leadTimeDays} {combo.leadTimeDays > 1 ? t('product.days') : t('product.days')} {t('product.leadTime')}</span>
                  </div>
                )}
                {combo.category && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaTag />
                    <span className="capitalize">{combo.category.replace('-', ' + ')}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {combo.tags && combo.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {combo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!combo.isActive}
                className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                  !combo.isActive ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaShoppingCart />
                <span>
                  {combo.isActive ? t('product.addToCart') : t('product.outOfStock')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetail;

