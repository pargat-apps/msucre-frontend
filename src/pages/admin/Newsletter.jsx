import React, { useEffect, useState } from 'react';
import {
  FaEnvelope,
  FaUser,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaPaperPlane,
  FaEye,
  FaSpinner
} from 'react-icons/fa';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import { useToast } from '../../components/Toast';
import Loading from '../../components/Loading';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' or 'send-email'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    recipientFilter: 'active',
    testEmail: '',
    fromEmail: ''
  });
  const [emailConfig, setEmailConfig] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSubscribers(true);
    fetchEmailConfig();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSubscribers(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [filter, pagination.page]);

  const fetchEmailConfig = async () => {
    try {
      const response = await api.get('/newsletter/email-config');
      const config = response.data.data;
      setEmailConfig(config);
      // Set default from email if not already set in form
      setEmailForm(prev => {
        if (!prev.fromEmail && config.fromEmailPlain) {
          return { ...prev, fromEmail: config.fromEmailPlain };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching email config:', error);
    }
  };

  const fetchSubscribers = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filter !== 'all') {
        params.append('active', filter === 'active' ? 'true' : 'false');
      }

      const response = await api.get(`/newsletter?${params}`);
      setSubscribers(response.data.data);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      if (showLoading) {
        toast.error('Failed to fetch subscribers');
      }
      console.error('Error fetching subscribers:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const updateSubscriberStatus = async (id, isActive) => {
    try {
      await api.put(`/newsletter/${id}/status`, { isActive });
      toast.success(`Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSubscribers(false);
    } catch (error) {
      toast.error('Failed to update subscriber status');
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(s => s.isActive);
    const csvContent = [
      ['Email', 'Name', 'Subscribed At', 'Source'].join(','),
      ...activeSubscribers.map(s => [
        s.email,
        s.name || '',
        new Date(s.subscribedAt).toLocaleDateString(),
        s.source || 'other'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscribers exported successfully!');
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch =
      !search ||
      subscriber.email.toLowerCase().includes(search.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.isActive).length,
    inactive: subscribers.filter(s => !s.isActive).length
  };

  const sendPromotionalEmail = async (isTest = false) => {
    if (!emailForm.subject || !emailForm.content) {
      toast.error('Please fill in subject and content');
      return;
    }

    if (isTest && !emailForm.testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSending(true);
    setSendResults(null);

    try {
      const payload = {
        subject: emailForm.subject,
        content: emailForm.content,
        recipientFilter: emailForm.recipientFilter,
        ...(isTest && { testEmail: emailForm.testEmail }),
        ...(emailForm.fromEmail && { fromEmail: emailForm.fromEmail })
      };

      const response = await api.post('/newsletter/send-promotional', payload);
      
      setSendResults(response.data);
      toast.success(isTest ? 'Test email sent successfully!' : `Email sent to ${response.data.stats?.sent || 0} subscribers!`);
      
      if (!isTest) {
        // Clear form after successful send
        setEmailForm({
          subject: '',
          content: '',
          recipientFilter: 'active',
          testEmail: '',
          fromEmail: emailConfig?.fromEmailPlain || ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    if (emailForm.recipientFilter === 'active') {
      return subscribers.filter(s => s.isActive).length;
    }
    return subscribers.length;
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Newsletter Subscribers
              </h1>
              <p className="text-gray-600">
                Manage your email newsletter subscribers and their preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSubscribers}
                className="btn-outline flex items-center space-x-2"
                disabled={stats.active === 0}
              >
                <FaDownload />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => fetchSubscribers(true)}
                className="btn-outline flex items-center space-x-2"
              >
                <FaSync />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'subscribers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('send-email')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'send-email'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaPaperPlane className="inline mr-2" />
              Send Promotional Email
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inactive Subscribers</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimes className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Composer Section */}
        {activeTab === 'send-email' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Compose Promotional Email</h2>
              
              {/* From Email Display and Override */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address <span className="text-gray-500 font-normal">(default business email)</span>
                </label>
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Default Business Email:</strong> <span className="font-mono text-primary-600 font-semibold">{emailConfig?.fromEmail || emailConfig?.fromEmailPlain || 'monsieur.sucre.ca@gmail.com'}</span>
                  </p>
                  {emailConfig?.emailUser && (
                    <p className="text-xs text-gray-500">
                      SMTP Account: <span className="font-mono">{emailConfig.emailUser}</span>
                    </p>
                  )}
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ This email will be used for all newsletter communications unless overridden below
                  </p>
                </div>
                <input
                  type="text"
                  value={emailForm.fromEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                  placeholder={`Leave empty to use default: ${emailConfig?.fromEmailPlain || 'from config'}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 <strong>Leave empty</strong> to use default email ({emailConfig?.fromEmailPlain || 'from config'}). 
                  <br />Enter a custom email to override: <span className="font-mono">marketing@msucre.com</span> or <span className="font-mono">M. Sucre &lt;marketing@msucre.com&gt;</span>
                </p>
              </div>

              {/* Recipient Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <select
                  value={emailForm.recipientFilter}
                  onChange={(e) => setEmailForm({ ...emailForm, recipientFilter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active Subscribers Only ({stats.active})</option>
                  <option value="all">All Subscribers ({stats.total})</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Email will be sent to {getRecipientCount()} subscriber{getRecipientCount() !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="e.g., Special Offer: 20% Off All Cakes!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  placeholder="Write your promotional message here...&#10;&#10;Tip: Use line breaks to separate paragraphs. Personalization (customer name) is automatic."
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 Tip: Each subscriber will receive a personalized email with their name included.
                </p>
              </div>

              {/* Test Email */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Test Email (Optional)
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={emailForm.testEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, testEmail: e.target.value })}
                    placeholder="your-email@example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => sendPromotionalEmail(true)}
                    disabled={sending || !emailForm.subject || !emailForm.content || !emailForm.testEmail}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    <span>Send Test</span>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Send a test email to yourself before sending to all subscribers
                </p>
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-outline flex items-center space-x-2"
                  disabled={!emailForm.subject || !emailForm.content}
                >
                  <FaEye />
                  <span>{showPreview ? 'Hide Preview' : 'Preview Email'}</span>
                </button>
                <button
                  onClick={() => sendPromotionalEmail(false)}
                  disabled={sending || !emailForm.subject || !emailForm.content || getRecipientCount() === 0}
                  className="btn-primary flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send to {getRecipientCount()} Subscriber{getRecipientCount() !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              {showPreview && emailForm.subject && emailForm.content && (
                <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Email Preview</h3>
                  <div className="bg-white p-6 rounded-lg border border-gray-300">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">From:</p>
                      <p className="font-mono text-sm font-semibold">
                        {emailForm.fromEmail || emailConfig?.fromEmail || 'Default from config'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Subject:</p>
                      <p className="font-semibold">{emailForm.subject}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">To: Test User</p>
                      <div className="prose max-w-none">
                        <p className="mb-2">Hi Test User,</p>
                        <div className="whitespace-pre-wrap text-gray-700">
                          {emailForm.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Results */}
              {sendResults && (
                <div className={`mt-6 p-6 rounded-lg ${
                  sendResults.stats?.failed > 0 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">Send Results</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{sendResults.stats?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sent</p>
                      <p className="text-2xl font-bold text-green-600">{sendResults.stats?.sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{sendResults.stats?.failed || 0}</p>
                    </div>
                  </div>
                  {sendResults.errors && sendResults.errors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-red-600 mb-2">Errors:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {sendResults.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx}>• {error.email}: {error.error}</li>
                        ))}
                        {sendResults.errors.length > 5 && (
                          <li className="text-gray-500">... and {sendResults.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters and Search - Only show in subscribers tab */}
        {activeTab === 'subscribers' && (
          <>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Subscribers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {subscriber.name ? (
                            <>
                              <FaUser className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{subscriber.name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 italic">No name</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subscriber.isActive ? (
                            <>
                              <FaCheck className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FaTimes className="mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {subscriber.source || 'other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaCalendarAlt className="mr-2" />
                          {formatDateTime(subscriber.subscribedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updateSubscriberStatus(subscriber._id, !subscriber.isActive)}
                          className={`${
                            subscriber.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          } transition-colors`}
                        >
                          {subscriber.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaEnvelope className="mx-auto text-gray-300 text-4xl mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No subscribers found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {search || filter !== 'all'
                          ? 'Try adjusting your search or filter'
                          : 'Subscribers will appear here once they sign up'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> subscribers
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Newsletter;

