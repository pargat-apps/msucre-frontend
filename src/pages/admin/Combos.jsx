import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatPrice } from '../../utils/helpers';
import Loading from '../../components/Loading';

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: 'cake-pastry',
    items: [],
    images: [{ url: '', alt: '' }],
    isActive: true,
    isBestseller: false,
    leadTimeDays: 2,
    stockQuantity: -1,
    tags: []
  });

  useEffect(() => {
    fetchCombos(true);
    fetchProducts();
    const interval = setInterval(() => {
      fetchCombos(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCombos = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/combos/admin/all');
      setCombos(response.data.data);
    } catch (error) {
      if (showLoading) {
        toast.error('Failed to fetch combos');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const comboData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        leadTimeDays: parseInt(formData.leadTimeDays),
        stockQuantity: formData.stockQuantity !== '' ? parseInt(formData.stockQuantity) : -1,
        items: formData.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity)
        }))
      };

      if (editingCombo) {
        await api.put(`/combos/admin/${editingCombo._id}`, comboData);
        toast.success('Combo updated successfully! ✅');
      } else {
        await api.post('/combos/admin', comboData);
        toast.success('Combo created successfully! 🎂');
      }

      setShowModal(false);
      setEditingCombo(null);
      resetForm();
      fetchCombos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save combo');
    }
  };

  const handleEdit = (combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description,
      shortDescription: combo.shortDescription || '',
      price: combo.price,
      originalPrice: combo.originalPrice || '',
      category: combo.category || 'cake-pastry',
      items: combo.items.map(item => ({
        type: item.type,
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
        name: item.name
      })),
      images: combo.images?.length > 0 ? combo.images : [{ url: '', alt: '' }],
      isActive: combo.isActive !== undefined ? combo.isActive : true,
      isBestseller: combo.isBestseller || false,
      leadTimeDays: combo.leadTimeDays || 2,
      stockQuantity: combo.stockQuantity !== undefined ? combo.stockQuantity : -1,
      tags: combo.tags || []
    });
    setShowModal(true);
  };

  const handleDelete = async (comboId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/combos/admin/${comboId}`);
        toast.success('Combo deleted successfully!');
        fetchCombos();
      } catch (error) {
        toast.error('Failed to delete combo');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      category: 'cake-pastry',
      items: [],
      images: [{ url: '', alt: '' }],
      isActive: true,
      isBestseller: false,
      leadTimeDays: 2,
      stockQuantity: -1,
      tags: []
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { type: 'cake', productId: '', quantity: 1, name: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill name when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].name = product.title;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '' }]
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const updateImage = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData({ ...formData, images: newImages });
  };

  const addTag = () => {
    const tag = prompt('Enter tag name:');
    if (tag && tag.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()]
      });
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(search.toLowerCase()) ||
    combo.description.toLowerCase().includes(search.toLowerCase())
  );

  const cakeProducts = products.filter(p => !p.isPrepaid && p.available);
  const pastryProducts = products.filter(p => p.categories?.includes('pastry') || p.title.toLowerCase().includes('pastry'));

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Combo Deals</h1>
          <p className="text-gray-600 mt-1">Manage cake and pastry combo deals</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Combo</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search combos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCombos.map((combo) => (
          <div key={combo._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {combo.images?.[0]?.url ? (
                <img
                  src={combo.images[0].url}
                  alt={combo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaSearch className="text-4xl" />
                </div>
              )}
              {!combo.isActive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Inactive
                </div>
              )}
              {combo.isBestseller && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs">
                  Bestseller
                </div>
              )}
              {combo.originalPrice && combo.originalPrice > combo.price && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{combo.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{combo.shortDescription || combo.description}</p>
              
              <div className="mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <span className="font-medium">Items:</span>
                  <span>{combo.items?.length || 0} products</span>
                </div>
                <div className="text-xs text-gray-500">
                  {combo.items?.map((item, idx) => (
                    <span key={idx}>
                      {item.name || item.productId?.title || 'Product'} x{item.quantity}
                      {idx < combo.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(combo.price)}
                  </span>
                  {combo.originalPrice && combo.originalPrice > combo.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatPrice(combo.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(combo)}
                  className="flex-1 btn-outline flex items-center justify-center space-x-1"
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(combo._id, combo.name)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCombos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No combos found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCombo ? 'Edit Combo' : 'Create New Combo'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCombo(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combo Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="cake-pastry">Cake + Pastry</option>
                    <option value="cake-only">Cake Only</option>
                    <option value="pastry-only">Pastry Only</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description (shown in cards)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (CAD) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (for discount)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Combo Items * (Cakes & Pastries)
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-outline text-sm flex items-center space-x-1"
                  >
                    <FaPlus />
                    <span>Add Item</span>
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="cake">Cake</option>
                          <option value="pastry">Pastry</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="">Select Product</option>
                          {(item.type === 'cake' ? cakeProducts : pastryProducts).map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No items added. Click "Add Item" to start.</p>
                )}
              </div>

              {/* Images */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <button
                    type="button"
                    onClick={addImage}
                    className="btn-outline text-sm flex items-center space-x-1"
                  >
                    <FaPlus />
                    <span>Add Image</span>
                  </button>
                </div>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={image.url}
                      onChange={(e) => updateImage(index, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={image.alt}
                      onChange={(e) => updateImage(index, 'alt', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-outline text-sm"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-primary-700 hover:text-primary-900"
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCombo(null);
                    resetForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCombo ? 'Update Combo' : 'Create Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combos;

