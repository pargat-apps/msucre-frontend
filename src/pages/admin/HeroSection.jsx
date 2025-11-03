import React, { useEffect, useState } from 'react';
import { FaUpload, FaSave, FaImage, FaStar } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';

const HeroSection = () => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadType, setUploadType] = useState('url');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [heroData, setHeroData] = useState({
    mainHeading: 'M. Sucre',
    tagline: 'Artisan Cakes Made with Love',
    description: 'Create your dream cake or choose from our exquisite collection. Every cake is handcrafted with premium ingredients and lots of love.',
    primaryCTA: {
      text: '🎂 Start a Custom Cake',
      link: '/custom-cakes'
    },
    secondaryCTA: {
      text: 'Browse Catalog',
      link: '/catalog'
    },
    heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    badges: [
      { text: 'Free Sample Available', icon: '✓' },
      { text: '10% Off First Order', icon: '✓' },
      { text: '2-Day Lead Time', icon: '✓' }
    ],
    locations: ['Gatineau (Quebec)', 'Downtown Ottawa'],
    customerAvatars: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    ],
    happyCustomersCount: '500+'
  });

  useEffect(() => {
    // Try to load saved settings
    const savedData = localStorage.getItem('heroSection');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure all required fields exist
        setHeroData({
          mainHeading: parsed.mainHeading || 'M. Sucre',
          tagline: parsed.tagline || 'Artisan Cakes Made with Love',
          description: parsed.description || 'Create your dream cake or choose from our exquisite collection.',
          primaryCTA: parsed.primaryCTA || { text: '🎂 Start a Custom Cake', link: '/custom-cakes' },
          secondaryCTA: parsed.secondaryCTA || { text: 'Browse Catalog', link: '/catalog' },
          heroImage: parsed.heroImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
          badges: parsed.badges || [],
          locations: parsed.locations || ['Gatineau (Quebec)', 'Downtown Ottawa'],
          customerAvatars: parsed.customerAvatars || [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
          ],
          happyCustomersCount: parsed.happyCustomersCount || '500+'
        });
        setImagePreview(parsed.heroImage || '');
      } catch (e) {
        console.log('Using default hero settings');
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = heroData.heroImage;

      // If file was uploaded, convert to base64
      if (uploadedImage) {
        toast.info('Processing image...', 2000);
        const reader = new FileReader();
        const imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImage);
        });
        imageUrl = imageData;
      }

      const dataToSave = {
        ...heroData,
        heroImage: imageUrl || heroData.heroImage
      };

      // Save to localStorage (works immediately)
      localStorage.setItem('heroSection', JSON.stringify(dataToSave));
      
      toast.success('Hero section updated successfully! 🎉');
      
      setUploadedImage(null);
      setHeroData(dataToSave);
      setImagePreview(dataToSave.heroImage);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBadge = (index, field, value) => {
    const newBadges = [...heroData.badges];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setHeroData({ ...heroData, badges: newBadges });
  };

  const addBadge = () => {
    setHeroData({
      ...heroData,
      badges: [...heroData.badges, { text: 'New Badge', icon: '✓' }]
    });
  };

  const removeBadge = (index) => {
    setHeroData({
      ...heroData,
      badges: heroData.badges.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              Hero Section Manager
            </h1>
            <p className="text-gray-600">
              Customize your homepage hero section
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <FaSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">📱 Live Preview</h2>
              
              {/* Preview */}
              <div className="bg-gradient-to-br from-primary-50 via-white to-pink-50 rounded-xl p-8">
                <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Serving {heroData.locations.join(' & ')}
                </div>
                
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
                  {heroData.mainHeading}
                </h1>
                
                <p className="text-xl text-gray-600 mb-4 italic">
                  {heroData.tagline}
                </p>

                <p className="text-gray-600 mb-6 text-sm">
                  {heroData.description}
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <button className="btn-primary text-sm">
                    {heroData.primaryCTA.text}
                  </button>
                  <button className="btn-secondary text-sm">
                    {heroData.secondaryCTA.text}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {heroData.badges.map((badge, i) => (
                    <div key={i} className="flex items-center space-x-1 text-green-600">
                      <span>{badge.icon}</span>
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {imagePreview && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">Hero Image:</h3>
                  <img
                    src={imagePreview}
                    alt="Hero"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Customer Badge Preview */}
              {heroData.customerAvatars && heroData.customerAvatars.length > 0 && (
                <div className="mt-6 bg-white rounded-xl p-4 border">
                  <h3 className="text-sm font-semibold mb-3">Customer Badge:</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      {heroData.customerAvatars.slice(0, 3).map((avatar, i) => (
                        <img
                          key={i}
                          src={avatar}
                          alt={`Customer ${i + 1}`}
                          className="w-10 h-10 rounded-full border-2 border-white object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <FaStar key={i} className="text-yellow-400 text-sm" />
                        ))}
                      </div>
                      <p className="text-sm font-semibold">{heroData.happyCustomersCount || '500+'} Happy Customers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="space-y-6">
            {/* Text Content */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">📝 Text Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    value={heroData.mainHeading}
                    onChange={(e) => setHeroData({ ...heroData, mainHeading: e.target.value })}
                    className="input-field"
                    placeholder="M. Sucre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={heroData.tagline}
                    onChange={(e) => setHeroData({ ...heroData, tagline: e.target.value })}
                    className="input-field"
                    placeholder="Artisan Cakes Made with Love"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={heroData.description}
                    onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                    className="input-field"
                    placeholder="Describe your business..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">🔘 Call-to-Action Buttons</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.primaryCTA.text}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      primaryCTA: { ...heroData.primaryCTA, text: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroData.primaryCTA.link}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      primaryCTA: { ...heroData.primaryCTA, link: e.target.value }
                    })}
                    className="input-field"
                    placeholder="/custom-cakes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.secondaryCTA.text}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      secondaryCTA: { ...heroData.secondaryCTA, text: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroData.secondaryCTA.link}
                    onChange={(e) => setHeroData({
                      ...heroData,
                      secondaryCTA: { ...heroData.secondaryCTA, link: e.target.value }
                    })}
                    className="input-field"
                    placeholder="/catalog"
                  />
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">🖼️ Hero Image</h2>

              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    uploadType === 'url'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaImage />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    uploadType === 'file'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaUpload />
                  <span>Upload File</span>
                </button>
              </div>

              {uploadType === 'url' && (
                <div>
                  <input
                    type="url"
                    value={heroData.heroImage}
                    onChange={(e) => {
                      setHeroData({ ...heroData, heroImage: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="input-field"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x800px
                  </p>
                </div>
              )}

              {uploadType === 'file' && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label htmlFor="hero-image-upload" className="cursor-pointer">
                      <FaUpload className="text-5xl text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">Upload Hero Image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                  {uploadedImage && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Selected: {uploadedImage.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Info Badges */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">✓ Quick Info Badges</h2>
                <button
                  onClick={addBadge}
                  className="text-sm text-primary-600 hover:underline"
                >
                  + Add Badge
                </button>
              </div>

              <div className="space-y-3">
                {heroData.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={badge.text}
                      onChange={(e) => updateBadge(index, 'text', e.target.value)}
                      className="input-field flex-1"
                      placeholder="Badge text"
                    />
                    <button
                      onClick={() => removeBadge(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Avatars */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">👥 Customer Avatars</h2>
              <p className="text-sm text-gray-600 mb-4">
                Manage customer photos shown in hero badge
              </p>
              
              <div className="space-y-3">
                {(heroData.customerAvatars || []).map((avatar, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
                      }}
                    />
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => {
                        const newAvatars = [...heroData.customerAvatars];
                        newAvatars[index] = e.target.value;
                        setHeroData({ ...heroData, customerAvatars: newAvatars });
                      }}
                      className="input-field flex-1"
                      placeholder="https://images.unsplash.com/photo-...?w=100"
                    />
                    {index > 2 && (
                      <button
                        onClick={() => {
                          const newAvatars = (heroData.customerAvatars || []).filter((_, i) => i !== index);
                          setHeroData({ ...heroData, customerAvatars: newAvatars });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                
                {(heroData.customerAvatars || []).length < 5 && (
                  <button
                    onClick={() => {
                      setHeroData({
                        ...heroData,
                        customerAvatars: [
                          ...(heroData.customerAvatars || []),
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
                        ]
                      });
                    }}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    + Add Avatar
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Happy Customers Count
                </label>
                <input
                  type="text"
                  value={heroData.happyCustomersCount}
                  onChange={(e) => setHeroData({ ...heroData, happyCustomersCount: e.target.value })}
                  className="input-field"
                  placeholder="500+"
                />
              </div>
            </div>

            {/* Locations */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">📍 Service Locations</h2>
              <div className="space-y-3">
                {heroData.locations.map((location, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        const newLocations = [...heroData.locations];
                        newLocations[index] = e.target.value;
                        setHeroData({ ...heroData, locations: newLocations });
                      }}
                      className="input-field"
                      placeholder="Location name"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full text-lg flex items-center justify-center space-x-2"
            >
              <FaSave />
              <span>{saving ? 'Saving Changes...' : 'Save Hero Section'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
