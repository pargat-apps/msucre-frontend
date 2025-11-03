import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = React.forwardRef(({ toast, onClose }, ref) => {
  const getConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: FaCheckCircle,
          iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500',
          iconColor: 'text-white',
          containerBg: 'bg-white/95 backdrop-blur-lg',
          borderColor: 'border-emerald-500/30',
          shadowColor: 'shadow-emerald-500/20',
          textColor: 'text-gray-800',
          title: 'Success',
          progressBg: 'from-emerald-500 to-green-600',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        };
      case 'error':
        return {
          icon: FaExclamationTriangle,
          iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
          iconColor: 'text-white',
          containerBg: 'bg-white/95 backdrop-blur-lg',
          borderColor: 'border-red-500/30',
          shadowColor: 'shadow-red-500/20',
          textColor: 'text-gray-800',
          title: 'Error',
          progressBg: 'from-red-500 to-rose-600',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          iconColor: 'text-white',
          containerBg: 'bg-white/95 backdrop-blur-lg',
          borderColor: 'border-amber-500/30',
          shadowColor: 'shadow-amber-500/20',
          textColor: 'text-gray-800',
          title: 'Warning',
          progressBg: 'from-amber-500 to-orange-600',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        };
      case 'info':
      default:
        return {
          icon: FaInfoCircle,
          iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
          iconColor: 'text-white',
          containerBg: 'bg-white/95 backdrop-blur-lg',
          borderColor: 'border-blue-500/30',
          shadowColor: 'shadow-blue-500/20',
          textColor: 'text-gray-800',
          title: 'Information',
          progressBg: 'from-blue-500 to-indigo-600',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 400, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 400, scale: 0.8, y: -20 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        mass: 0.8
      }}
      className={`relative ${config.containerBg} ${config.borderColor} border-2 rounded-2xl ${config.shadowColor} shadow-2xl ${config.glow} p-5 flex items-start gap-4 max-w-md pointer-events-auto`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)'
      }}
    >
      {/* Icon with gradient background */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 25 }}
        className={`flex-shrink-0 ${config.iconBg} ${config.iconColor} rounded-xl p-2.5 shadow-lg`}
      >
        <IconComponent className="text-xl" />
      </motion.div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className={`${config.textColor} font-semibold text-sm mb-1 tracking-wide`}>
          {config.title}
        </div>
        <p className={`${config.textColor} text-sm leading-relaxed font-medium`}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className={`flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100`}
        aria-label="Close notification"
      >
        <FaTimes className="text-sm" />
      </motion.button>

      {/* Animated progress bar */}
      {toast.duration > 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.progressBg} rounded-b-2xl`}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ 
            duration: toast.duration / 1000, 
            ease: 'linear',
            originX: 0
          }}
        />
      )}

      {/* Decorative corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${config.iconBg} opacity-10 rounded-bl-full -z-10`} />
    </motion.div>
  );
});

Toast.displayName = 'Toast';

export default ToastProvider;

