import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    flavor: '',
    search: ''
  });

  useEffect(() => {
    fetchProducts(true); // Initial load with loading state
    // Auto-refresh products every 60 seconds to show product updates from admin
    const interval = setInterval(() => {
      fetchProducts(false); // Refresh without loading state
    }, 60000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.flavor) params.append('flavor', filters.flavor);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8 text-center">
          Our Catalog
        </h1>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="prepaid">Already Prepaid</option>
                <option value="bestseller">Bestsellers</option>
                <option value="bento">Bento Cakes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flavor</label>
              <select
                value={filters.flavor}
                onChange={(e) => handleFilterChange('flavor', e.target.value)}
                className="input-field"
              >
                <option value="">All Flavors</option>
                <option value="Vanilla">Vanilla</option>
                <option value="Chocolate">Chocolate</option>
                <option value="Red Velvet">Red Velvet</option>
                <option value="Nutella">Nutella</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search cakes..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProducts} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;

