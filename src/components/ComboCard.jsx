import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTag, FaGift } from 'react-icons/fa';
import { formatPrice } from '../utils/helpers';
import { useTranslation } from '../hooks/useTranslation';

const ComboCard = ({ combo }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/combos/${combo._id}`);
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

  return (
    <div onClick={handleClick} className="card group hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {combo.images?.[0]?.url ? (
          <img
            src={getImageUrl(combo.images[0].url)}
            alt={combo.images[0].alt || combo.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FaGift className="text-6xl" />
          </div>
        )}
        {combo.isBestseller && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t('product.bestseller')}
          </span>
        )}
        {combo.originalPrice && combo.originalPrice > combo.price && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)}% OFF
          </span>
        )}
        {!combo.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors flex-1">
            {combo.name}
          </h3>
          <FaTag className="text-primary-600 ml-2 flex-shrink-0" />
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {combo.shortDescription || combo.description}
        </p>

        {/* Items Preview */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {combo.items?.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {item.name || item.productId?.title || 'Product'} x{item.quantity}
              </span>
            ))}
            {combo.items?.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                +{combo.items.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(combo.price)}
            </span>
            {combo.originalPrice && combo.originalPrice > combo.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatPrice(combo.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Lead time */}
        {combo.leadTimeDays > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            🕐 {combo.leadTimeDays} {combo.leadTimeDays > 1 ? t('product.days') : t('product.days')} {t('product.leadTime')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ComboCard;

