import React, { useEffect, useState } from 'react';
import { FaStar, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import Loading from '../../components/Loading';

const Reviews = () => {
  const [pendingReviews, setpendingReviews] = useState([]);
  const [publishedReviews, setPublishedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchReviews(true); // Initial load with loading state
    // Auto-refresh reviews every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchReviews(false); // Refresh without loading state
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReviews = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const [pendingRes, publishedRes] = await Promise.all([
        api.get('/reviews/admin/pending'),
        api.get('/reviews')
      ]);
      setpendingReviews(pendingRes.data.data);
      setPublishedReviews(publishedRes.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (showLoading) {
        toast.error(error.response?.data?.message || 'Failed to fetch reviews');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const publishReview = async (reviewId, customerName) => {
    try {
      await api.put(`/reviews/admin/${reviewId}/publish`, { published: true });
      toast.success(`Review by ${customerName} published! ✅`);
      fetchReviews(false); // Refresh without loading
    } catch (error) {
      console.error('Error publishing review:', error);
      toast.error(error.response?.data?.message || 'Failed to publish review');
    }
  };

  const unpublishReview = async (reviewId, customerName) => {
    try {
      await api.put(`/reviews/admin/${reviewId}/publish`, { published: false });
      toast.success(`Review by ${customerName} unpublished`);
      fetchReviews(false); // Refresh without loading
    } catch (error) {
      console.error('Error unpublishing review:', error);
      toast.error(error.response?.data?.message || 'Failed to unpublish review');
    }
  };

  const deleteReview = async (reviewId, customerName) => {
    if (window.confirm(`Delete review by ${customerName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/reviews/admin/${reviewId}`);
        toast.success('Review deleted successfully');
        fetchReviews(false);
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error(error.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const ReviewCard = ({ review, isPending }) => {
    const productTitle = typeof review.productId === 'object' && review.productId?.title 
      ? review.productId.title 
      : review.productId || 'General Review';
    
    return (
      <div className="card p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-700">{review.rating}/5</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{review.title}</h3>
            {productTitle && (
              <p className="text-sm text-gray-500 mb-2">Product: {productTitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            {review.verifiedPurchase && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
            )}
            {isPending && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</span>
            )}
          </div>
        </div>

        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.body}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div>
            <span className="font-medium">{review.customerName}</span>
            {typeof review.userId === 'object' && review.userId?.email && (
              <span className="text-gray-400 ml-2">({review.userId.email})</span>
            )}
          </div>
          <span>{formatDateTime(review.createdAt)}</span>
        </div>
        
        {typeof review.orderId === 'object' && review.orderId?.orderNumber && (
          <div className="text-xs text-gray-500 mb-4 pb-4 border-b">
            Order: {review.orderId.orderNumber}
          </div>
        )}

        <div className="flex items-center space-x-2 pt-4 border-t">
          {isPending ? (
            <>
              <button
                onClick={() => publishReview(review._id, review.customerName)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
              >
                <FaCheck />
                <span>Approve & Publish</span>
              </button>
              <button
                onClick={() => deleteReview(review._id, review.customerName)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Delete Review"
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => unpublishReview(review._id, review.customerName)}
                className="flex-1 btn-outline py-2 text-sm"
              >
                Unpublish
              </button>
              <button
                onClick={() => deleteReview(review._id, review.customerName)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Delete Review"
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Manage Reviews</h1>
          <p className="text-gray-600">Approve, publish, or manage customer reviews</p>
        </div>

        {/* Pending Reviews */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mr-3">
              {pendingReviews.length} Pending
            </span>
            Reviews Awaiting Approval
          </h2>
          {pendingReviews.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">No pending reviews</p>
              <p className="text-gray-400 text-sm mt-2">All reviews have been processed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReviews.map(review => (
                <ReviewCard key={review._id} review={review} isPending={true} />
              ))}
            </div>
          )}
        </div>

        {/* Published Reviews */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Published Reviews ({publishedReviews.length})
          </h2>
          {publishedReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No published reviews yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedReviews.map(review => (
                <ReviewCard key={review._id} review={review} isPending={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;

