import React, { useEffect, useState } from 'react';
import { FaStar, FaUser, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loading from '../components/Loading';
import { formatDateTime } from '../utils/helpers';
import { motion } from 'framer-motion';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'verified', '5star'

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      let fetchedReviews = response.data.data || [];
      
      // Apply filters
      if (filter === 'verified') {
        fetchedReviews = fetchedReviews.filter(r => r.verifiedPurchase);
      } else if (filter === '5star') {
        fetchedReviews = fetchedReviews.filter(r => r.rating === 5);
      }
      
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Count reviews by rating
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Customer Reviews
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            See what our customers are saying about M. Sucre
          </p>

          {/* Average Rating Summary */}
          {reviews.length > 0 && (
            <div className="inline-flex items-center space-x-4 bg-white rounded-lg p-6 shadow-md">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600 mb-1">
                  {averageRating}
                </div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
              <div className="border-l border-gray-200 pl-6 space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-3 text-sm">
                    <span className="text-gray-600 w-12">{rating} star{rating > 1 ? 's' : ''}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${reviews.length > 0 ? (ratingCounts[rating] / reviews.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-8 text-right">{ratingCounts[rating]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'verified'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Verified Only ({reviews.filter(r => r.verifiedPurchase).length})
          </button>
          <button
            onClick={() => setFilter('5star')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === '5star'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            5 Star ({ratingCounts[5]})
          </button>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Reviews Yet</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "Be the first to leave a review!"
                : "No reviews match your filter criteria."}
            </p>
            <Link to="/catalog" className="btn-primary inline-flex items-center space-x-2">
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {review.customerName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {review.customerName || 'Anonymous'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {review.productId && (
                            <Link
                              to={review.productId.slug ? `/products/${review.productId.slug}` : '#'}
                              className="text-primary-600 hover:underline"
                            >
                              {review.productId.title || 'Product'}
                            </Link>
                          )}
                          <span>•</span>
                          <span>{formatDateTime(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <FaCheckCircle className="text-xs" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-xl text-gray-900 mb-2">
                    {review.title}
                  </h4>
                )}

                <p className="text-gray-700 leading-relaxed mb-4">
                  {review.body}
                </p>

                {review.productId && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to={review.productId.slug ? `/products/${review.productId.slug}` : '#'}
                      className="text-primary-600 hover:underline text-sm font-medium"
                    >
                      View Product →
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {reviews.length > 0 && (
          <div className="mt-12 text-center">
            <div className="card p-8 bg-gradient-to-r from-primary-50 to-pink-50 border-2 border-primary-200">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                Love Our Cakes? Share Your Experience!
              </h2>
              <p className="text-gray-600 mb-6">
                After your purchase, leave a review and help other customers discover their perfect cake.
              </p>
              <Link to="/catalog" className="btn-primary inline-flex items-center space-x-2">
                <span>Shop Now</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;

