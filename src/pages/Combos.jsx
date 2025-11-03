import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ComboCard from '../components/ComboCard';
import Loading from '../components/Loading';
import { useTranslation } from '../hooks/useTranslation';

const Combos = () => {
  const { t } = useTranslation();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'cake-pastry', 'cake-only', 'pastry-only', 'special'

  useEffect(() => {
    fetchCombos(true);
    const interval = setInterval(() => {
      fetchCombos(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchCombos = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams({ active: 'true' });
      if (filter !== 'all') {
        params.append('category', filter);
      }

      const response = await api.get(`/combos?${params.toString()}`);
      setCombos(response.data.data);
    } catch (error) {
      console.error('Error fetching combos:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            🎁 Combo Deals
          </h1>
          <p className="text-lg text-gray-600">
            Perfect combinations of cakes and pastries at unbeatable prices
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Combos
            </button>
            <button
              onClick={() => setFilter('cake-pastry')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'cake-pastry'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cake + Pastry
            </button>
            <button
              onClick={() => setFilter('cake-only')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'cake-only'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cake Only
            </button>
            <button
              onClick={() => setFilter('pastry-only')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pastry-only'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pastry Only
            </button>
            <button
              onClick={() => setFilter('special')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'special'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Special
            </button>
          </div>
        </div>

        {/* Combos Grid */}
        {combos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {combos.map((combo) => (
              <ComboCard key={combo._id} combo={combo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No combos available at the moment.</p>
            <Link to="/catalog" className="btn-primary mt-4 inline-block">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Combos;

