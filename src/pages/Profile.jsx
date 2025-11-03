import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loading from '../components/Loading';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully! ✅', 3000);
      setEditing(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (authLoading) return <Loading fullScreen />;
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please login to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 rounded-full p-4">
                <FaUser className="text-3xl text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                required
                className={`input-field ${!editing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`input-field ${!editing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your phone number"
              />
            </div>

            {editing && (
              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FaSave />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || ''
                    });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Account Type:</span> {user.role === 'admin' || user.role === 'editor' ? 'Administrator' : 'Customer'}</p>
              <p><span className="font-medium">Member Since:</span> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

