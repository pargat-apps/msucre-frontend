import React from 'react';
import { FaCheck, FaClock, FaSpinner, FaBirthdayCake, FaImage, FaLayerGroup, FaRuler, FaCalendarAlt, FaEnvelope, FaPhone, FaPalette, FaComment, FaExclamationCircle } from 'react-icons/fa';
import { formatDateTime, formatPrice } from '../utils/helpers';

const CustomCakeTimeline = ({ request }) => {
  // Define custom cake status steps
  const customCakeSteps = [
    { status: 'pending', label: 'Request Received', icon: FaClock },
    { status: 'quoted', label: 'Quote Provided', icon: FaEnvelope },
    { status: 'approved', label: 'Quote Approved', icon: FaCheck },
    { status: 'design-confirmed', label: 'Design Confirmed', icon: FaImage },
    { status: 'in-production', label: 'In Production', icon: FaBirthdayCake },
    { status: 'ready', label: 'Ready for Pickup', icon: FaCheck },
    { status: 'completed', label: 'Completed', icon: FaCheck }
  ];

  const getCurrentStepIndex = () => {
    return customCakeSteps.findIndex(step => step.status === request.status);
  };

  const currentIndex = getCurrentStepIndex();

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Get backend URL - handle both relative and absolute URLs
    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // If VITE_API_URL is a relative path like '/api', we need the backend port
    if (backendUrl.startsWith('/api')) {
      // Backend runs on port 5000, frontend on different port
      // Extract port from current location or use default 5000
      const currentPort = window.location.port;
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // If frontend is on 3000/3001, backend is on 5000
      backendUrl = isDev ? `http://localhost:5000` : window.location.origin.replace(/:\d+$/, ':5000');
    } else if (!backendUrl.startsWith('http')) {
      // If it's not a full URL, use localhost:5000 in dev, origin in prod
      backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    }
    
    // Ensure image path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Combine backend URL with image path
    const fullUrl = `${backendUrl}${path}`;
    return fullUrl;
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-display font-bold mb-6">Custom Cake Timeline</h2>

      {/* Detailed Cake Information */}
      <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-xl border border-purple-100">
        <div className="flex items-center space-x-2 mb-4">
          <FaBirthdayCake className="text-purple-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900">Custom Cake Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cake Specifications</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FaBirthdayCake className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Flavor</p>
                    <p className="font-semibold text-gray-900">{request.flavor}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaLayerGroup className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Layers</p>
                    <p className="font-semibold text-gray-900">{request.layers} {request.layers === 1 ? 'layer' : 'layers'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRuler className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-semibold text-gray-900">{request.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaBirthdayCake className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Shape</p>
                    <p className="font-semibold text-gray-900">{request.shape || 'Round'}</p>
                  </div>
                </div>
                {request.icing && (
                  <div className="flex items-center space-x-2">
                    <FaPalette className="text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Icing Type</p>
                      <p className="font-semibold text-gray-900">{request.icing}</p>
                    </div>
                  </div>
                )}
                {request.theme && (
                  <div className="flex items-center space-x-2">
                    <FaPalette className="text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Theme</p>
                      <p className="font-semibold text-gray-900">{request.theme}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Additional Information</p>
              <div className="space-y-3">
                {request.fillings && request.fillings.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Fillings</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {request.fillings.map((filling, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          {filling}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {request.dietaryRequirements && request.dietaryRequirements.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Dietary Requirements</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {request.dietaryRequirements.map((req, idx) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {request.messageOnCake && (
                  <div>
                    <p className="text-xs text-gray-500">Message on Cake</p>
                    <p className="font-semibold text-primary-600 mt-1">"{request.messageOnCake}"</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(request.deadlineAt)}</p>
                  </div>
                </div>
                {request.priceQuote && (
                  <div>
                    <p className="text-xs text-gray-500">Quote Amount</p>
                    <p className="font-bold text-primary-600 text-lg">{formatPrice(request.priceQuote)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {request.notes && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Notes</p>
            <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">{request.notes}</p>
          </div>
        )}

        {/* Reference Images */}
        {request.referenceImages && request.referenceImages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference Images ({request.referenceImages.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {request.referenceImages.map((image, idx) => {
                const imageUrl = getImageUrl(image.url);
                return (
                  <div key={idx} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-purple-400 transition-colors cursor-pointer"
                      onError={(e) => {
                        console.error('Failed to load image:', imageUrl, 'Original path:', image.url);
                        e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
                      }}
                      onLoad={() => {
                        console.log('Successfully loaded image:', imageUrl);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {customCakeSteps.map((stepInfo, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timelineEntry = request.timeline?.find(t => t.step === stepInfo.status);
          const IconComponent = stepInfo.icon;

          return (
            <div key={stepInfo.status} className="flex items-start mb-8 last:mb-0">
              {/* Timeline line */}
              {index < customCakeSteps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-12 ${
                    isCompleted ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  style={{ marginTop: `${index * 96}px` }}
                />
              )}

              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-purple-600 text-white'
                    : isCurrent
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <FaCheck />
                ) : isCurrent ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <IconComponent />
                )}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${isCurrent ? 'text-purple-600' : 'text-gray-900'}`}>
                    {stepInfo.label}
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

      {/* Current Status Badge */}
      <div className="mt-6">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          request.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
          request.status === 'approved' ? 'bg-green-100 text-green-800' :
          request.status === 'design-confirmed' ? 'bg-purple-100 text-purple-800' :
          request.status === 'in-production' ? 'bg-indigo-100 text-indigo-800' :
          request.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
          request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {request.status === 'pending' && '⏳ Pending Review'}
          {request.status === 'quoted' && '💰 Quote Sent'}
          {request.status === 'approved' && '✅ Approved'}
          {request.status === 'design-confirmed' && '🎨 Design Confirmed'}
          {request.status === 'in-production' && '🔨 In Production'}
          {request.status === 'ready' && '🎂 Ready for Pickup'}
          {request.status === 'completed' && '✨ Completed'}
          {request.status === 'cancelled' && '❌ Cancelled'}
        </span>
      </div>

      {/* Deadline Warning */}
      {new Date(request.deadlineAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && request.status !== 'completed' && (
        <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationCircle className="text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Upcoming Deadline</p>
              <p className="text-xs text-amber-700">
                Deadline: {formatDateTime(request.deadlineAt)} ({Math.ceil((new Date(request.deadlineAt) - new Date()) / (1000 * 60 * 60 * 24))} days remaining)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCakeTimeline;

