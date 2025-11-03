import React, { useEffect, useState } from 'react';
import { FaSave, FaPlus, FaTrash, FaEdit, FaSearch, FaCog, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [settingsDetails, setSettingsDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [editingSettings, setEditingSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSettings(true);
    const interval = setInterval(() => {
      fetchSettings(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/settings/admin/all');
      setSettings(response.data.data || {});
      setSettingsDetails(response.data.details || {});
      setEditingSettings(response.data.data || {});
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      if (showLoading) {
        toast.error(error.response?.data?.message || 'Failed to fetch settings');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleInputChange = (key, value, subKey = null) => {
    setEditingSettings(prev => {
      const newSettings = { ...prev };
      if (subKey !== null) {
        if (!newSettings[key]) newSettings[key] = {};
        newSettings[key] = { ...newSettings[key], [subKey]: value };
      } else {
        newSettings[key] = value;
      }
      return newSettings;
    });
    setHasChanges(true);
  };

  const handleArrayAdd = (key, newItem = '') => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newItem]
    }));
    setHasChanges(true);
  };

  const handleArrayRemove = (key, index) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleArrayUpdate = (key, index, value) => {
    setEditingSettings(prev => {
      const newArray = [...(prev[key] || [])];
      newArray[index] = value;
      return { ...prev, [key]: newArray };
    });
    setHasChanges(true);
  };

  const handleObjectArrayAdd = (key) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), {}]
    }));
    setHasChanges(true);
  };

  const handleObjectArrayRemove = (key, index) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleObjectArrayUpdate = (key, index, field, value) => {
    setEditingSettings(prev => {
      const newArray = [...(prev[key] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [key]: newArray };
    });
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      const promises = Object.entries(editingSettings).map(([key, value]) =>
        api.put(`/settings/admin/${key}`, {
          value: value,
          description: settingsDetails[key]?.description || ''
        })
      );

      await Promise.all(promises);
      toast.success('All settings saved successfully! ✅');
      setHasChanges(false);
      fetchSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    }
  };

  const handleSaveSingle = async (key) => {
    try {
      await api.put(`/settings/admin/${key}`, {
        value: editingSettings[key],
        description: settingsDetails[key]?.description || ''
      });
      toast.success(`Setting "${key}" saved successfully! ✅`);
      fetchSettings(false);
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error(error.response?.data?.message || 'Failed to save setting');
    }
  };

  const handleReset = () => {
    setEditingSettings(settings);
    setHasChanges(false);
    toast.info('Changes reset to last saved values');
  };

  // Setting categories
  const settingCategories = {
    general: {
      title: 'General Settings',
      icon: '📋',
      keys: ['tagline']
    },
    contact: {
      title: 'Contact Information',
      icon: '📞',
      keys: ['eTransferEmail', 'whatsappNumber', 'businessPhone', 'locations']
    },
    social: {
      title: 'Social Media',
      icon: '🔗',
      keys: ['socialMedia']
    },
    hours: {
      title: 'Operating Hours',
      icon: '🕐',
      keys: ['operatingHours']
    },
    delivery: {
      title: 'Delivery Settings',
      icon: '🚚',
      keys: ['deliveryAreas']
    },
    popup: {
      title: 'Popup Configuration',
      icon: '🎁',
      keys: ['popupConfig']
    },
    certifications: {
      title: 'Certifications',
      icon: '🏆',
      keys: ['certifications']
    },
    media: {
      title: 'Media Content',
      icon: '🎬',
      keys: ['youtubeVideos', 'tiktokEmbeds']
    },
    other: {
      title: 'Other Settings',
      icon: '⚙️',
      keys: []
    }
  };

  // Get all known keys
  const allKnownKeys = Object.values(settingCategories).flatMap(cat => cat.keys);
  const otherKeys = Object.keys(settings).filter(key => !allKnownKeys.includes(key));
  settingCategories.other.keys = otherKeys;

  // Filter settings by search
  const getFilteredKeys = (keys) => {
    if (!search) return keys;
    return keys.filter(key => 
      key.toLowerCase().includes(search.toLowerCase()) ||
      (settingsDetails[key]?.description || '').toLowerCase().includes(search.toLowerCase())
    );
  };

  const renderStringField = (key, label, placeholder = '') => {
    const value = editingSettings[key] || '';
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {settingsDetails[key]?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails[key].description})</span>
          )}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    );
  };

  const renderArrayField = (key, label, placeholder = 'Add item') => {
    const value = editingSettings[key] || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {settingsDetails[key]?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails[key].description})</span>
          )}
        </label>
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayUpdate(key, index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => handleArrayRemove(key, index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd(key, '')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaPlus /> <span>{placeholder}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSocialMediaFields = () => {
    const socialMedia = editingSettings.socialMedia || {};
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Media Links
          {settingsDetails.socialMedia?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.socialMedia.description})</span>
          )}
        </label>
        <div className="space-y-3">
          {['youtube', 'tiktok', 'instagram', 'facebook'].map(platform => (
            <div key={platform}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{platform}</label>
              <input
                type="url"
                value={socialMedia[platform] || ''}
                onChange={(e) => handleInputChange('socialMedia', e.target.value, platform)}
                placeholder={`https://${platform}.com/your-username`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOperatingHoursFields = () => {
    const hours = editingSettings.operatingHours || {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Operating Hours
          {settingsDetails.operatingHours?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.operatingHours.description})</span>
          )}
        </label>
        <div className="space-y-2">
          {days.map(day => (
            <div key={day} className="flex items-center gap-3">
              <label className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</label>
              <input
                type="text"
                value={hours[day] || ''}
                onChange={(e) => handleInputChange('operatingHours', e.target.value, day)}
                placeholder="9:00 AM - 6:00 PM"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPopupConfigFields = () => {
    const config = editingSettings.popupConfig || {};
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popup Configuration
          {settingsDetails.popupConfig?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.popupConfig.description})</span>
          )}
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="popupEnabled"
              checked={config.enabled || false}
              onChange={(e) => handleInputChange('popupConfig', e.target.checked, 'enabled')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="popupEnabled" className="text-sm font-medium text-gray-700">
              Enable Popup
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Popup Type</label>
            <select
              value={config.type || 'freeSample'}
              onChange={(e) => handleInputChange('popupConfig', e.target.value, 'type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="freeSample">Free Sample</option>
              <option value="discount">Discount</option>
              <option value="limitedTime">Limited Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea
              value={config.message || ''}
              onChange={(e) => handleInputChange('popupConfig', e.target.value, 'message')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter popup message"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
            <select
              value={config.frequency || 'once-per-session'}
              onChange={(e) => handleInputChange('popupConfig', e.target.value, 'frequency')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="once-per-session">Once Per Session</option>
              <option value="always">Always Show</option>
              <option value="once-per-day">Once Per Day</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificationsFields = () => {
    const certs = editingSettings.certifications || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications & Licenses
          {settingsDetails.certifications?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.certifications.description})</span>
          )}
        </label>
        <div className="space-y-3">
          {certs.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
                <button
                  onClick={() => handleObjectArrayRemove('certifications', index)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => handleObjectArrayUpdate('certifications', index, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Certification name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={cert.description || ''}
                    onChange={(e) => handleObjectArrayUpdate('certifications', index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Certification description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={cert.image || ''}
                    onChange={(e) => handleObjectArrayUpdate('certifications', index, 'image', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="/uploads/cert-image.jpg"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleObjectArrayAdd('certifications')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaPlus /> <span>Add Certification</span>
          </button>
        </div>
      </div>
    );
  };

  const renderYouTubeVideosFields = () => {
    const videos = editingSettings.youtubeVideos || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube Videos
          {settingsDetails.youtubeVideos?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.youtubeVideos.description})</span>
          )}
        </label>
        <div className="space-y-2">
          {videos.map((video, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={typeof video === 'string' ? video : video.url || ''}
                onChange={(e) => {
                  if (typeof video === 'string') {
                    handleArrayUpdate('youtubeVideos', index, e.target.value);
                  } else {
                    handleObjectArrayUpdate('youtubeVideos', index, 'url', e.target.value);
                  }
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => handleArrayRemove('youtubeVideos', index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd('youtubeVideos', '')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaPlus /> <span>Add YouTube Video URL</span>
          </button>
        </div>
      </div>
    );
  };

  const renderTikTokEmbedsFields = () => {
    const embeds = editingSettings.tiktokEmbeds || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          TikTok Embeds
          {settingsDetails.tiktokEmbeds?.description && (
            <span className="text-xs text-gray-500 ml-2">({settingsDetails.tiktokEmbeds.description})</span>
          )}
        </label>
        <div className="space-y-2">
          {embeds.map((embed, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={typeof embed === 'string' ? embed : embed.url || ''}
                onChange={(e) => {
                  if (typeof embed === 'string') {
                    handleArrayUpdate('tiktokEmbeds', index, e.target.value);
                  } else {
                    handleObjectArrayUpdate('tiktokEmbeds', index, 'url', e.target.value);
                  }
                }}
                placeholder="https://tiktok.com/@username/video/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => handleArrayRemove('tiktokEmbeds', index)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleArrayAdd('tiktokEmbeds', '')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaPlus /> <span>Add TikTok Embed URL</span>
          </button>
        </div>
      </div>
    );
  };

  const renderGenericField = (key) => {
    const value = editingSettings[key];
    const valueType = typeof value;
    
    if (value === null || value === undefined) {
      return renderStringField(key, key, `Enter value for ${key}`);
    }
    
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        // Object array - render as JSON editor for now
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{key}</label>
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  handleInputChange(key, JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        );
      }
      return renderArrayField(key, key, `Add ${key} item`);
    }
    
    if (valueType === 'object') {
      // Complex object - render as JSON editor
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{key}</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                handleInputChange(key, JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      );
    }
    
    if (valueType === 'boolean') {
      return (
        <div className="mb-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(key, e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">{key}</span>
          </label>
        </div>
      );
    }
    
    return renderStringField(key, key, `Enter ${key}`);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Site Settings</h1>
          <p className="text-gray-600">Manage all website configuration and settings</p>
        </div>

        {/* Search and Save */}
        <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Changes
              </button>
            )}
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className={`btn-primary px-6 py-2 flex items-center gap-2 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaSave />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {Object.entries(settingCategories).map(([tabKey, category]) => {
              const filteredKeys = getFilteredKeys(category.keys);
              if (filteredKeys.length === 0 && !search) return null;
              
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tabKey
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {(() => {
            const category = settingCategories[activeTab];
            const filteredKeys = getFilteredKeys(category.keys);
            
            if (filteredKeys.length === 0) {
              return (
                <div className="text-center py-12">
                  <FaCog className="mx-auto text-5xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No settings found</p>
                  {search && (
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search</p>
                  )}
                </div>
              );
            }

            return (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {category.icon} {category.title}
                </h2>
                
                {filteredKeys.map(key => (
                  <div key={key} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-mono">{key}</h3>
                        {settingsDetails[key]?.description && (
                          <p className="text-sm text-gray-600 mt-1">{settingsDetails[key].description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSaveSingle(key)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                      >
                        <FaSave /> Save
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      {key === 'socialMedia' && renderSocialMediaFields()}
                      {key === 'operatingHours' && renderOperatingHoursFields()}
                      {key === 'popupConfig' && renderPopupConfigFields()}
                      {key === 'certifications' && renderCertificationsFields()}
                      {key === 'locations' && renderArrayField('locations', 'Service Locations', 'Add Location')}
                      {key === 'deliveryAreas' && renderArrayField('deliveryAreas', 'Delivery Areas', 'Add Delivery Area')}
                      {key === 'youtubeVideos' && renderYouTubeVideosFields()}
                      {key === 'tiktokEmbeds' && renderTikTokEmbedsFields()}
                      {key === 'tagline' && renderStringField('tagline', 'Site Tagline', 'Enter tagline')}
                      {key === 'eTransferEmail' && renderStringField('eTransferEmail', 'E-Transfer Email', 'payment@example.com')}
                      {key === 'whatsappNumber' && renderStringField('whatsappNumber', 'WhatsApp Number', '+1234567890')}
                      {key === 'businessPhone' && renderStringField('businessPhone', 'Business Phone', '+1234567890')}
                      {!['socialMedia', 'operatingHours', 'popupConfig', 'certifications', 'locations', 'deliveryAreas', 'youtubeVideos', 'tiktokEmbeds', 'tagline', 'eTransferEmail', 'whatsappNumber', 'businessPhone'].includes(key) && renderGenericField(key)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
