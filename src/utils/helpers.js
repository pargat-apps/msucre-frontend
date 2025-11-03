// Format price in CAD
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format datetime
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate discount amount
export const calculateDiscount = (subtotal, percentage) => {
  return subtotal * (percentage / 100);
};

// Calculate tax (HST 13% for Ontario/Quebec)
export const calculateTax = (amount) => {
  return amount * 0.13;
};

// Generate slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Truncate text
export const truncate = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Check if date is in the past
export const isPast = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in the future
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

// Get minimum order date (lead time days from now)
export const getMinOrderDate = (leadTimeDays = 2) => {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  return date.toISOString().split('T')[0];
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const re = /^[+]?[\d\s()-]{10,}$/;
  return re.test(phone);
};

// WhatsApp link generator
export const getWhatsAppLink = (phoneNumber, message = '') => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    'Order Placed': 'bg-blue-100 text-blue-800',
    'Awaiting e-Transfer': 'bg-yellow-100 text-yellow-800',
    'Payment Received': 'bg-green-100 text-green-800',
    'Design Confirmed': 'bg-purple-100 text-purple-800',
    'In Preparation': 'bg-orange-100 text-orange-800',
    'Ready for Pickup': 'bg-cyan-100 text-cyan-800',
    'Out for Delivery': 'bg-indigo-100 text-indigo-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

