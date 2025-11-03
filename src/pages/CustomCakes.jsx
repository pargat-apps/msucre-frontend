import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getMinOrderDate, formatPrice } from '../utils/helpers';

const CustomCakes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    flavor: 'Vanilla',
    size: '8 inch (serves 10-12)',
    shape: 'Round',
    layers: 2,
    fillings: [],
    icing: 'Buttercream',
    messageOnCake: '',
    theme: '',
    dietaryRequirements: [],
    deadlineAt: getMinOrderDate(6), // 6 days advance as per terms
    notes: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(75);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles].slice(0, 5));
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const currentValues = formData[name] || [];
      setFormData({
        ...formData,
        [name]: checked
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Update estimated price based on selections
    calculateEstimatedPrice({ ...formData, [name]: value });
  };

  const calculateEstimatedPrice = (data) => {
    let price = 50; // Base price
    
    // Size pricing
    if (data.size.includes('10 inch')) price += 30;
    else if (data.size.includes('12 inch')) price += 60;
    else if (data.size.includes('14 inch')) price += 100;
    
    // Layers
    price += (data.layers - 1) * 15;
    
    // Fillings
    price += (data.fillings?.length || 0) * 5;
    
    setEstimatedPrice(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields with proper formatting
      Object.keys(formData).forEach(key => {
        if (key === 'fillings' || key === 'dietaryRequirements') {
          // Arrays - send as JSON string
          if (Array.isArray(formData[key]) && formData[key].length > 0) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          }
        } else if (key === 'layers') {
          // Ensure layers is sent as a number string
          formDataToSend.append(key, formData[key].toString());
        } else if (key === 'deadlineAt') {
          // Ensure date is in ISO format
          const date = new Date(formData[key]);
          if (!isNaN(date.getTime())) {
            formDataToSend.append(key, date.toISOString());
          }
        } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          // Other fields - only send if not empty
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await api.post('/custom-requests', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Custom cake request submitted successfully! We will contact you soon with a quote. 🎂', 4000);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Submission error:', error.response?.data);
      
      // Show detailed validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        toast.error(`Validation errors: ${errorMessages}`, 6000);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit request. Please check all required fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Create Your Custom Cake
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below and we'll create the perfect cake for your special occasion
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          {/* Customer Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Reference Images */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reference Images</h2>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
              <input {...getInputProps()} />
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Drag & drop images here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">Maximum 5 images</p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cake Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cake Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flavor *</label>
                <select name="flavor" value={formData.flavor} onChange={handleChange} className="input-field">
                  <option>Vanilla</option>
                  <option>Chocolate</option>
                  <option>Red Velvet</option>
                  <option>Nutella</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                <select name="size" value={formData.size} onChange={handleChange} className="input-field">
                  <option>6 inch (serves 6-8)</option>
                  <option>8 inch (serves 10-12)</option>
                  <option>10 inch (serves 15-20)</option>
                  <option>12 inch (serves 25-30)</option>
                  <option>14 inch (serves 40-50)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                <select name="shape" value={formData.shape} onChange={handleChange} className="input-field">
                  <option>Round</option>
                  <option>Square</option>
                  <option>Rectangle</option>
                  <option>Heart</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Layers</label>
                <input
                  type="number"
                  name="layers"
                  value={formData.layers}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icing Type</label>
                <select name="icing" value={formData.icing} onChange={handleChange} className="input-field">
                  <option>Buttercream</option>
                  <option>Cream Cheese</option>
                  <option>Fondant</option>
                  <option>Whipped Cream</option>
                  <option>Ganache</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline Date *</label>
                <input
                  type="date"
                  name="deadlineAt"
                  value={formData.deadlineAt}
                  onChange={handleChange}
                  min={getMinOrderDate(6)}
                  required
                  className="input-field"
                  title="Minimum 6 days advance notice required"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message on Cake</label>
              <input
                type="text"
                name="messageOnCake"
                value={formData.messageOnCake}
                onChange={handleChange}
                placeholder="e.g., Happy Birthday Sarah!"
                maxLength="50"
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme/Occasion</label>
              <input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="e.g., Princess theme, Wedding, Anniversary"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any special requests or details..."
                className="input-field"
              ></textarea>
            </div>
          </div>

          {/* Estimated Price */}
          <div className="bg-primary-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estimated Price</h3>
                <p className="text-sm text-gray-600">Final price will be confirmed after review</p>
              </div>
              <div className="text-3xl font-bold text-primary-600">
                {formatPrice(estimatedPrice)}
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Important Information:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Minimum 6 days advance notice</strong> required for all orders</li>
              <li>• 50% non-refundable deposit needed to confirm your order</li>
              <li>• Changes must be requested at least 4 days before delivery date</li>
              <li>• All products may contain dairy, gluten, and eggs - please inform us of allergies</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? 'Submitting...' : 'Submit Custom Cake Request'}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            We'll review your request and send you a detailed quote within 24 hours. 
            By submitting, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:underline font-semibold">
              Terms and Conditions
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomCakes;

