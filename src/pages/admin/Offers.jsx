import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTag, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaUsers } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import Loading from '../../components/Loading';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive, promo, sessional, registration
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'promo',
    percentOff: '',
    code: '',
    startsAt: '',
    endsAt: '',
    active: true,
    scope: 'sitewide',
    applicableCategories: [],
    applicableProductIds: [],
    maxUsesPerCustomer: 1
  });

  useEffect(() => {
    fetchOffers(true); // Initial load with loading state
    // Auto-refresh offers every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOffers(false); // Refresh without loading state
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOffers = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/offers/admin/all');
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      if (showLoading) {
        toast.error(error.response?.data?.message || 'Failed to fetch offers');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const offerData = {
        ...formData,
        percentOff: parseFloat(formData.percentOff),
        maxUsesPerCustomer: parseInt(formData.maxUsesPerCustomer, 10),
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        code: formData.code ? formData.code.toUpperCase() : undefined
      };

      // Remove empty fields
      if (!offerData.code) delete offerData.code;
      if (!offerData.startsAt) delete offerData.startsAt;
      if (!offerData.endsAt) delete offerData.endsAt;
      if (!offerData.applicableCategories || offerData.applicableCategories.length === 0) {
        delete offerData.applicableCategories;
      }
      if (!offerData.applicableProductIds || offerData.applicableProductIds.length === 0) {
        delete offerData.applicableProductIds;
      }

      if (editingOffer) {
        await api.put(`/offers/admin/${editingOffer._id}`, offerData);
        toast.success('Offer updated successfully! ✅');
      } else {
        await api.post('/offers/admin', offerData);
        toast.success('Offer created successfully! ✅');
      }

      setShowModal(false);
      resetForm();
      fetchOffers(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name || '',
      type: offer.type || 'promo',
      percentOff: offer.percentOff || '',
      code: offer.code || '',
      startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : '',
      endsAt: offer.endsAt ? new Date(offer.endsAt).toISOString().slice(0, 16) : '',
      active: offer.active !== undefined ? offer.active : true,
      scope: offer.scope || 'sitewide',
      applicableCategories: offer.applicableCategories || [],
      applicableProductIds: offer.applicableProductIds || [],
      maxUsesPerCustomer: offer.maxUsesPerCustomer || 1
    });
    setShowModal(true);
  };

  const handleDelete = async (offerId, offerName) => {
    if (window.confirm(`Delete offer "${offerName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/offers/admin/${offerId}`);
        toast.success('Offer deleted successfully');
        fetchOffers(false);
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error(error.response?.data?.message || 'Failed to delete offer');
      }
    }
  };

  const toggleActive = async (offer) => {
    try {
      await api.put(`/offers/admin/${offer._id}`, { active: !offer.active });
      toast.success(`Offer ${!offer.active ? 'activated' : 'deactivated'} successfully`);
      fetchOffers(false);
    } catch (error) {
      console.error('Error toggling offer status:', error);
      toast.error(error.response?.data?.message || 'Failed to update offer status');
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      name: '',
      type: 'promo',
      percentOff: '',
      code: '',
      startsAt: '',
      endsAt: '',
      active: true,
      scope: 'sitewide',
      applicableCategories: [],
      applicableProductIds: [],
      maxUsesPerCustomer: 1
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const isOfferValid = (offer) => {
    if (!offer.active) return false;
    const now = new Date();
    if (offer.startsAt && now < new Date(offer.startsAt)) return false;
    if (offer.endsAt && now > new Date(offer.endsAt)) return false;
    return true;
  };

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(search.toLowerCase()) ||
      (offer.code && offer.code.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && isOfferValid(offer);
    if (filter === 'inactive') return matchesSearch && !isOfferValid(offer);
    if (filter === 'promo') return matchesSearch && offer.type === 'promo';
    if (filter === 'sessional') return matchesSearch && offer.type === 'sessional';
    if (filter === 'registration') return matchesSearch && offer.type === 'registration';
    
    return matchesSearch;
  });

  const stats = {
    total: offers.length,
    active: offers.filter(o => isOfferValid(o)).length,
    inactive: offers.filter(o => !isOfferValid(o)).length,
    promo: offers.filter(o => o.type === 'promo').length,
    sessional: offers.filter(o => o.type === 'sessional').length,
    registration: offers.filter(o => o.type === 'registration').length
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Manage Offers & Promos</h1>
          <p className="text-gray-600">Create and manage promotional offers, seasonal discounts, and registration bonuses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Offers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-600 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Promo Codes</p>
            <p className="text-2xl font-bold text-blue-700">{stats.promo}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">Seasonal</p>
            <p className="text-2xl font-bold text-purple-700">{stats.sessional}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 mb-1">Registration</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.registration}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Offers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="promo">Promo Codes</option>
            <option value="sessional">Seasonal</option>
            <option value="registration">Registration</option>
          </select>
          <button
            onClick={handleOpenModal}
            className="btn-primary flex items-center space-x-2 px-6 py-2"
          >
            <FaPlus />
            <span>New Offer</span>
          </button>
        </div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <FaTag className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No offers found</p>
            <p className="text-gray-400 text-sm mb-4">
              {search || filter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first offer to get started'}
            </p>
            {!search && filter === 'all' && (
              <button onClick={handleOpenModal} className="btn-primary">
                Create Offer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers.map(offer => (
              <div key={offer._id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{offer.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        offer.type === 'promo' ? 'bg-blue-100 text-blue-800' :
                        offer.type === 'sessional' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {offer.type}
                      </span>
                      {isOfferValid(offer) ? (
                        <FaCheckCircle className="text-green-500" title="Valid" />
                      ) : (
                        <FaTimesCircle className="text-red-500" title="Invalid/Expired" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-primary-600 mb-2">{offer.percentOff}% OFF</p>
                    {offer.code && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Code:</span>{' '}
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">{offer.code}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>
                      {offer.startsAt
                        ? `Starts: ${formatDateTime(offer.startsAt)}`
                        : 'No start date'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>
                      {offer.endsAt
                        ? `Ends: ${formatDateTime(offer.endsAt)}`
                        : 'No end date'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-gray-400" />
                    <span>Scope: {offer.scope}</span>
                    {offer.usageCount > 0 && (
                      <span className="ml-2 text-primary-600">
                        ({offer.usageCount} uses)
                      </span>
                    )}
                  </div>
                  {offer.maxUsesPerCustomer > 0 && (
                    <div className="text-xs text-gray-500">
                      Max uses per customer: {offer.maxUsesPerCustomer}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <button
                    onClick={() => toggleActive(offer)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      offer.active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {offer.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(offer)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    title="Edit Offer"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id, offer.name)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Offer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, code: e.target.value === 'promo' ? formData.code : '' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="promo">Promo Code</option>
                      <option value="sessional">Seasonal</option>
                      <option value="registration">Registration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.percentOff}
                      onChange={(e) => setFormData({ ...formData, percentOff: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                </div>

                {formData.type === 'promo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      required={formData.type === 'promo'}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                      placeholder="SUMMER2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">Code will be automatically uppercased</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope *
                  </label>
                  <select
                    required
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="sitewide">Sitewide</option>
                    <option value="category">Category</option>
                    <option value="products">Specific Products</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Uses Per Customer
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxUsesPerCustomer}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = unlimited</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Active (Offer is enabled)
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2"
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;

