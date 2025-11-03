import React, { useState, useEffect } from 'react';
import { FaTimes, FaGift, FaPercent, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const PromotionalPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState(null);

  useEffect(() => {
    fetchPopupConfig();
  }, []);

  const fetchPopupConfig = async () => {
    try {
      const response = await api.get('/settings/popupConfig');
      const config = response.data.data;
      
      if (config && config.enabled) {
        // Check if popup was already shown in this session
        const shownThisSession = sessionStorage.getItem('popupShown');
        
        if (!shownThisSession) {
          setPopupConfig(config);
          // Show popup after 3 seconds
          setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem('popupShown', 'true');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching popup config:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!popupConfig) return null;

  const getIcon = () => {
    switch (popupConfig.type) {
      case 'freeSample':
        return <FaGift className="text-5xl text-green-500" />;
      case 'discount':
        return <FaPercent className="text-5xl text-primary-500" />;
      case 'limitedTime':
        return <FaClock className="text-5xl text-orange-500" />;
      default:
        return <FaGift className="text-5xl text-primary-500" />;
    }
  };

  const getTitle = () => {
    switch (popupConfig.type) {
      case 'freeSample':
        return '🎁 Free Sample Available!';
      case 'discount':
        return '💝 Special Discount!';
      case 'limitedTime':
        return '⏰ Limited Time Offer!';
      default:
        return '🎉 Special Offer!';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  {getIcon()}
                </div>

                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                  {getTitle()}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {popupConfig.message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      handleClose();
                      window.location.href = '/catalog';
                    }}
                    className="btn-primary flex-1"
                  >
                    Shop Now
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-outline flex-1"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PromotionalPopup;

