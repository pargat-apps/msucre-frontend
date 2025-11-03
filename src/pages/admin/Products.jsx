import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUpload, FaImage } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import { formatPrice } from '../../utils/helpers';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    flavor: 'Vanilla',
    categories: [],
    allergens: [],
    leadTimeDays: 2,
    sampleEligible: false,
    isBestseller: false,
    isPrepaid: false,
    isBento: false,
    available: true,
    images: [{ url: '', alt: '' }]
  });

  useEffect(() => {
    fetchProducts(true); // Initial load with loading state
    // Auto-refresh products every 30 seconds to show updates in real-time
    const interval = setInterval(() => {
      fetchProducts(false); // Refresh without loading state
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      if (showLoading) {
        toast.error('Failed to fetch products');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-generate slug from title if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      let imageUrl = formData.images[0]?.url || '';

      // If file was uploaded, upload it first
      if (uploadedImage) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', uploadedImage);
        
        try {
          // For now, we'll use a placeholder. In production, upload to Cloudinary/S3
          // You can implement actual upload endpoint later
          const reader = new FileReader();
          reader.onloadend = () => {
            imageUrl = reader.result; // Base64 for now (not ideal for production)
          };
          reader.readAsDataURL(uploadedImage);
          
          // Wait a bit for the FileReader
          await new Promise(resolve => setTimeout(resolve, 100));
          
          toast.info('Note: For production, configure Cloudinary or S3 for image hosting', 4000);
        } catch (uploadError) {
          toast.error('Image upload failed. Using URL instead.');
        }
      }
      
      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        images: [{ url: imageUrl || formData.images[0]?.url, alt: formData.title }]
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully! ✅');
      } else {
        await api.post('/products', productData);
        toast.success('Product created successfully! 🎂');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      setUploadedImage(null);
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      flavor: product.flavor || 'Vanilla',
      categories: product.categories || [],
      allergens: product.allergens || [],
      leadTimeDays: product.leadTimeDays || 2,
      sampleEligible: product.sampleEligible || false,
      isBestseller: product.isBestseller || false,
      isPrepaid: product.isPrepaid || false,
      isBento: product.isBento || false,
      available: product.available !== undefined ? product.available : true,
      images: product.images || [{ url: '', alt: '' }]
    });
    setShowModal(true);
  };

  const handleDelete = async (productId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      price: '',
      flavor: 'Vanilla',
      categories: [],
      allergens: [],
      leadTimeDays: 2,
      sampleEligible: false,
      isBestseller: false,
      isPrepaid: false,
      isBento: false,
      available: true,
      images: [{ url: '', alt: '' }]
    });
    setUploadedImage(null);
    setImagePreview(null);
    setUploadType('url');
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.flavor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Manage Products</h1>
            <p className="text-gray-600">{products.length} total products</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or flavor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="card overflow-hidden">
                <img
                  src={product.images[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    {!product.available && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                    {product.flavor && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.flavor}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.isBestseller && (
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">Bestseller</span>
                    )}
                    {product.isPrepaid && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Prepaid</span>
                    )}
                    {product.isBento && (
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded">Bento</span>
                    )}
                    {product.sampleEligible && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Free Sample</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-display font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Classic Vanilla Dream"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                      className="input-field"
                      placeholder="Auto-generated from title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="Delicious cake description..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (CAD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                      placeholder="45.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flavor
                    </label>
                    <select
                      value={formData.flavor}
                      onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                      className="input-field"
                    >
                      <option>Vanilla</option>
                      <option>Chocolate</option>
                      <option>Red Velvet</option>
                      <option>Nutella</option>
                      <option>Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time (days)
                    </label>
                    <input
                      type="number"
                      value={formData.leadTimeDays}
                      onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Image *
                  </label>

                  {/* Upload Type Toggle */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadType('url')}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        uploadType === 'url'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <FaImage />
                      <span>Image URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('file')}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        uploadType === 'file'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <FaUpload />
                      <span>Upload File</span>
                    </button>
                  </div>

                  {/* URL Input */}
                  {uploadType === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={formData.images[0]?.url || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            images: [{ url: e.target.value, alt: formData.title }]
                          });
                          setImagePreview(e.target.value);
                        }}
                        className="input-field"
                        placeholder="https://images.unsplash.com/photo-...?w=800&h=600&fit=crop&q=80"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Get free images from <a href="https://unsplash.com/s/photos/cake" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Unsplash</a>
                      </p>
                    </div>
                  )}

                  {/* File Upload */}
                  {uploadType === 'file' && (
                    <div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setUploadedImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                      {uploadedImage && (
                        <div className="mt-2 text-sm text-green-600 flex items-center space-x-2">
                          <FaImage />
                          <span>Selected: {uploadedImage.name}</span>
                        </div>
                      )}
                      <p className="text-xs text-yellow-600 mt-2">
                        💡 Tip: For production, configure Cloudinary or AWS S3 for permanent storage
                      </p>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['prepaid', 'bestseller', 'bento'].map((cat) => (
                      <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestseller}
                      onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">Bestseller</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sampleEligible}
                      onChange={(e) => setFormData({ ...formData, sampleEligible: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">Free Sample</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? 'Update Product' : 'Create Product'}
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

export default Products;

