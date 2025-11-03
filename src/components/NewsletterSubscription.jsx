import React, { useState } from 'react';
import { FaEnvelope, FaSpinner, FaCheck } from 'react-icons/fa';
import { useToast } from './Toast';
import api from '../utils/api';

const NewsletterSubscription = ({ source = 'other', compact = false, showName = false }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', {
        email,
        name: showName ? name : undefined,
        source
      });

      setSuccess(true);
      toast.success('Successfully subscribed! Check your email for confirmation. 🎉');
      setEmail('');
      setName('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-gray-900"
            disabled={loading || success}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || success}
          className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
            success
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Subscribing...</span>
            </>
          ) : success ? (
            <>
              <FaCheck />
              <span>Subscribed!</span>
            </>
          ) : (
            <>
              <FaEnvelope />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-pink-50 rounded-xl p-6 md:p-8 border border-primary-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
          <FaEnvelope className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Stay Sweet! 🎂
        </h3>
        <p className="text-gray-600">
          Subscribe to our newsletter for exclusive deals, new flavors, and special promotions!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-gray-900"
              disabled={loading || success}
            />
          </div>
        )}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-gray-900"
            disabled={loading || success}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || success}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
            success
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Subscribing...</span>
            </>
          ) : success ? (
            <>
              <FaCheck />
              <span>Successfully Subscribed! ✓</span>
            </>
          ) : (
            <>
              <FaEnvelope />
              <span>Subscribe Now</span>
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default NewsletterSubscription;

