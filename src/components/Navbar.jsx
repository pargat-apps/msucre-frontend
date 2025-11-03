import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartCount = getCartCount();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-primary-600">M. Sucre</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/custom-cakes" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.customCakes')}
            </Link>
            <Link to="/catalog" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.catalog')}
            </Link>
            <Link to="/combos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Combos 🎁
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              {t('nav.contact')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <FaUser />
                  <span>{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-primary-50"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/my-orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-primary-50"
                  >
                    {t('nav.orders')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-primary-50"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline py-2">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary py-2">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <LanguageSelector className="mb-3" />
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/custom-cakes"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.customCakes')}
            </Link>
            <Link
              to="/catalog"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.catalog')}
            </Link>
            <Link
              to="/combos"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Combos 🎁
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            <Link
              to="/cart"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.cart')} ({cartCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.profile')}
                </Link>
                <Link
                  to="/my-orders"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.orders')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-primary-600"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

