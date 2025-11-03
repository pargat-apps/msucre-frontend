import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaYoutube, FaTiktok, FaInstagram, FaFacebook } from 'react-icons/fa';
import api from '../utils/api';
import NewsletterSubscription from './NewsletterSubscription';
import { useTranslation } from '../hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const whatsappNumber = settings?.whatsappNumber || '+1234567890';
  const socialMedia = settings?.socialMedia || {};
  const locations = settings?.locations || ['Gatineau (Quebec)', 'Downtown Ottawa'];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold text-primary-400 mb-4">M. Sucre</h3>
            <p className="text-gray-400 mb-4">
              {settings?.tagline || t('footer.tagline')}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>📍</span>
              <div>
                {locations.map((location, index) => (
                  <div key={index}>{location}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/custom-cakes" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.customCakes')}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.catalog')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.customerService')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/my-orders" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-400 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.newsletter')}</h4>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer.subscribeDesc')}
            </p>
            <div className="mb-6">
              <NewsletterSubscription source="footer" compact={true} />
            </div>
            
            <h4 className="text-lg font-semibold mb-4 mt-6">{t('footer.followUs')}</h4>
            <div className="flex space-x-4">
              {socialMedia.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-green-400 transition-colors"
                >
                  <FaWhatsapp />
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FaYoutube />
                </a>
              )}
              {socialMedia.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-white transition-colors"
                >
                  <FaTiktok />
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <FaInstagram />
                </a>
              )}
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <FaFacebook />
                </a>
              )}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Payment Method:</p>
              <div className="bg-gray-800 px-4 py-2 rounded-lg inline-block">
                <span className="text-sm font-semibold">Interac e-Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} M. Sucre. {t('footer.copyright')}</p>
          <p className="mt-2">
            {t('footer.madeWith')} ❤️ {t('footer.by')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

