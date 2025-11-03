import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaClock, FaSpinner, FaBirthdayCake, FaImage, FaLayerGroup, FaRuler } from 'react-icons/fa';
import { formatDateTime, getOrderStatusColor, formatPrice } from '../utils/helpers';

const OrderTimeline = ({ order }) => {
  // Check if order has any custom cake items
  const hasCustomCake = order.items?.some(item => item.customRequestId);
  
  // Simplified timeline - only show confirmed steps
  // "Design Confirmed" only for custom cakes
  const allSteps = [
    'Awaiting e-Transfer',
    'Payment Received',
    ...(hasCustomCake ? ['Design Confirmed'] : []), // Only include for custom cakes
    'In Preparation',
    order.delivery.mode === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
    'Completed'
  ];

  const getCurrentStepIndex = () => {
    return allSteps.indexOf(order.status);
  };

  const currentIndex = getCurrentStepIndex();

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}${imagePath}`;
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-display font-bold mb-6">Order Timeline</h2>

      {/* Order Items Details */}
      <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl border border-purple-100">
        <div className="flex items-center space-x-2 mb-4">
          <FaBirthdayCake className="text-purple-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
          <span className="ml-auto text-sm text-gray-600 font-medium">
            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.items?.map((item, index) => {
            // Get product image - handle both populated object and string ID
            let productImage = null;
            let productSlug = null;
            if (item.productId) {
              if (typeof item.productId === 'object') {
                if (item.productId.images) {
                  productImage = item.productId.images[0]?.url || item.productId.images[0];
                }
                if (item.productId.slug) {
                  productSlug = item.productId.slug;
                }
              }
            }
            
            // Check if it's a custom cake
            const isCustomCake = !!item.customRequestId || item.title?.toLowerCase().includes('custom');
            const customRequest = typeof item.customRequestId === 'object' ? item.customRequestId : null;
            
            // Determine if card should be clickable (only for regular products with slug)
            const isClickable = !isCustomCake && productSlug;
            
            // Card content component
            const CardContent = () => (
              <div className="bg-white rounded-lg p-4 border-2 border-gray-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start space-x-3">
                  {/* Item Image */}
                  {productImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={getImageUrl(productImage)}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Cake';
                        }}
                      />
                    </div>
                  )}
                  
                  {isCustomCake && !productImage && (
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg border-2 border-purple-300 flex items-center justify-center">
                      <FaImage className="text-purple-600 text-2xl" />
                    </div>
                  )}

                  {!productImage && !isCustomCake && (
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <FaBirthdayCake className="text-blue-600 text-2xl" />
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="space-y-1">
                          {/* Quantity & Price */}
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span className="font-medium">Qty:</span>
                            <span>{item.quantity}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-purple-600">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>

                          {/* Size */}
                          {item.selectedSize && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <FaRuler className="text-gray-400" />
                              <span>Size: {item.selectedSize}</span>
                            </div>
                          )}

                          {/* Custom Cake Details */}
                          {isCustomCake && customRequest && (
                            <>
                              {customRequest.flavor && (
                                <div className="flex items-center space-x-1 text-xs">
                                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    {customRequest.flavor}
                                  </span>
                                </div>
                              )}
                              {customRequest.layers > 1 && (
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <FaLayerGroup className="text-gray-400" />
                                  <span>{customRequest.layers} layers</span>
                                </div>
                              )}
                              {customRequest.size && (
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <span>Custom {customRequest.size}</span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Regular Product Flavor */}
                          {item.productId?.flavor && !isCustomCake && (
                            <div className="flex items-center space-x-1 text-xs">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {item.productId.flavor}
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <div className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Custom Request Indicator */}
                    {isCustomCake && (
                      <div className="mt-2 pt-2 border-t border-purple-100">
                        <span className="inline-flex items-center space-x-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          <FaBirthdayCake className="text-xs" />
                          <span>Custom Cake</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            // Wrap in Link if clickable, otherwise return as div
            if (isClickable) {
              return (
                <Link 
                  key={index}
                  to={`/products/${productSlug}`}
                  className="block cursor-pointer"
                >
                  <CardContent />
                </Link>
              );
            }

            return (
              <div key={index}>
                <CardContent />
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Order Total</span>
            <span className="text-lg font-bold text-purple-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        {allSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timelineEntry = order.timeline.find(t => t.step === step);

          return (
            <div key={step} className="flex items-start mb-8 last:mb-0">
              {/* Timeline line */}
              {index < allSteps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 ${
                    isCompleted ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  style={{ marginTop: `${index * 96}px` }}
                />
              )}

              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-primary-600 text-white'
                    : isCurrent
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <FaCheck />
                ) : isCurrent ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaClock />
                )}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isCurrent ? 'text-primary-600' : 'text-gray-900'}`}>
                    {step}
                  </h3>
                  {timelineEntry && (
                    <span className="text-sm text-gray-500">
                      {formatDateTime(timelineEntry.timestamp)}
                    </span>
                  )}
                </div>
                {timelineEntry?.note && (
                  <p className="text-sm text-gray-600 mt-1">{timelineEntry.note}</p>
                )}
                {isCurrent && !timelineEntry?.note && (
                  <p className="text-sm text-gray-600 mt-1">Currently at this stage...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated ready time */}
      {order.estimatedReadyAt && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-900">Estimated Ready Time</p>
          <p className="text-lg text-blue-700">{formatDateTime(order.estimatedReadyAt)}</p>
        </div>
      )}

      {/* Current status badge */}
      <div className="mt-6">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getOrderStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Contact info */}
      {order.contactChannels && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">Need Help?</p>
          <div className="space-y-1 text-sm text-gray-600">
            {order.contactChannels.whatsapp && (
              <p>
                📱 WhatsApp:{' '}
                <a
                  href={`https://wa.me/${order.contactChannels.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {order.contactChannels.whatsapp}
                </a>
              </p>
            )}
            {order.contactChannels.email && (
              <p>
                ✉️ Email:{' '}
                <a href={`mailto:${order.contactChannels.email}`} className="text-primary-600 hover:underline">
                  {order.contactChannels.email}
                </a>
              </p>
            )}
            {order.contactChannels.phone && (
              <p>📞 Phone: {order.contactChannels.phone}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;

