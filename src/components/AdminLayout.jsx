import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaShoppingBag, 
  FaTags, 
  FaStar, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaUsers,
  FaGift,
  FaImage,
  FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: FaChartLine },
    { name: 'Hero Section', path: '/admin/hero', icon: FaImage },
    { name: 'Products', path: '/admin/products', icon: FaBox },
    { name: 'Combos', path: '/admin/combos', icon: FaTags },
    { name: 'Orders', path: '/admin/orders', icon: FaShoppingBag },
    { name: 'Custom Requests', path: '/admin/custom-requests', icon: FaGift },
    { name: 'Reviews', path: '/admin/reviews', icon: FaStar },
    { name: 'Newsletter', path: '/admin/newsletter', icon: FaEnvelope },
    { name: 'Offers & Promos', path: '/admin/offers', icon: FaTags },
    { name: 'Settings', path: '/admin/settings', icon: FaCog },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-primary-600">M. Sucre</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-sm text-gray-600 hover:text-primary-600 flex items-center space-x-1"
            >
              <FaHome />
              <span className="hidden md:inline">View Website</span>
            </Link>
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Fixed/Sticky */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r transition-all duration-300 ease-in-out overflow-hidden flex flex-col fixed left-0 top-[73px] bottom-0 z-30`}
        >
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`text-xl ${active ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t bg-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">M. Sucre Admin v1.0</p>
                <Link to="/" className="text-xs text-primary-600 hover:underline">
                  Back to Website →
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

