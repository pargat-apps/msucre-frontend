import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaClock, FaCheck } from 'react-icons/fa';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { formatPrice } from '../utils/helpers';
import { saveRedirectUrl } from '../utils/redirect';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    fetchProductAndReviews(true); // Initial load with loading state
    // Auto-refresh product and reviews every 30 seconds to show updates
    const interval = setInterval(() => {
      fetchProductAndReviews(false); // Refresh without loading state
    }, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const fetchProductAndReviews = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get(`/products/${slug}`);
      const productData = response.data.data;
      setProduct(productData);
      
      // Set default size if available (only on initial load)
      if (showLoading && productData.sizeOptions && productData.sizeOptions.length > 0) {
        setSelectedSize(productData.sizeOptions[0].size);
      }
      
      // Fetch reviews for this product
      try {
        const reviewsResponse = await api.get(`/reviews`);
        const productReviews = reviewsResponse.data.data.filter(r => 
          r.productId && r.productId._id === productData._id
        );
        setReviews(productReviews);
      } catch (reviewErr) {
        console.error('Error fetching reviews:', reviewErr);
      }
      
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save current page URL for redirect after login/registration
      saveRedirectUrl(`/products/${slug}`);
      
      // Show message and redirect to registration
      toast.error('Please login or register to add items to cart', 3000);
      setTimeout(() => {
        navigate('/register');
      }, 1000);
      return;
    }

    // User is authenticated, proceed with adding to cart
    const price = selectedSize && product.sizeOptions
      ? product.sizeOptions.find(s => s.size === selectedSize)?.price || product.price
      : product.price;

    addToCart({
      productId: product._id,
      title: product.title,
      unitPrice: price,
      image: product.images[0]?.url,
      quantity: quantity,
      selectedSize: selectedSize
    });

    toast.success(`${quantity} x ${product.title} added to cart! 🎂`, 3000);
  };

  if (loading) return <Loading fullScreen />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <ErrorMessage message={error} onRetry={fetchProduct} />
      </div>
    </div>
  );
  if (!product) return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/catalog')} className="btn-primary">
          Back to Catalog
        </button>
      </div>
    </div>
  );

  const currentPrice = selectedSize && product.sizeOptions
    ? product.sizeOptions.find(s => s.size === selectedSize)?.price || product.price
    : product.price;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            Home
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <button onClick={() => navigate('/catalog')} className="text-primary-600 hover:underline">
            Catalog
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Image */}
          <div>
            <div className="card overflow-hidden">
              <img
                src={product.images[0]?.url || '/placeholder-cake.jpg'}
                alt={product.images[0]?.alt || product.title}
                className="w-full h-[500px] object-cover"
              />
            </div>

            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Badges */}
            <div className="flex items-center space-x-2 mb-4">
              {product.isBestseller && (
                <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Bestseller
                </span>
              )}
              {product.sampleEligible && (
                <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Free Sample Available
                </span>
              )}
              {product.isBento && (
                <span className="bg-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Bento Cake
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-600">
                {formatPrice(currentPrice)}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Flavor */}
            {product.flavor && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Flavor</h3>
                <span className="inline-block bg-primary-100 text-primary-800 px-4 py-2 rounded-lg font-medium">
                  {product.flavor}
                </span>
              </div>
            )}

            {/* Size Options */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.sizeOptions.map((option) => (
                    <button
                      key={option.size}
                      onClick={() => setSelectedSize(option.size)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        selectedSize === option.size
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.size}</div>
                      <div className="text-sm text-gray-600">Serves {option.serves}</div>
                      <div className="text-primary-600 font-semibold mt-1">
                        {formatPrice(option.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn-primary w-full text-lg mb-6 flex items-center justify-center space-x-2"
            >
              <FaShoppingCart />
              <span>Add to Cart - {formatPrice(currentPrice * quantity)}</span>
            </button>

            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              {product.leadTimeDays > 0 && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <FaClock className="text-primary-600" />
                  <span>{product.leadTimeDays} day{product.leadTimeDays > 1 ? 's' : ''} lead time</span>
                </div>
              )}
              
              {product.available ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <FaCheck className="text-green-600" />
                  <span>In Stock</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-700">
                  <span>Out of Stock</span>
                </div>
              )}

              {product.allergens && product.allergens.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Allergens</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
              Customer Reviews
            </h2>

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">{review.title}</h3>
                    </div>
                    {review.verifiedPurchase && (
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{review.body}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{review.customerName}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
            You May Also Like
          </h2>
          <div className="text-center">
            <button
              onClick={() => navigate('/catalog')}
              className="btn-secondary"
            >
              Browse More Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

