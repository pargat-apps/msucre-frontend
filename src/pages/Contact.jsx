import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';
import { getWhatsAppLink } from '../utils/helpers';
import { useTranslation } from '../hooks/useTranslation';

const Contact = () => {
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
  const businessPhone = settings?.businessPhone || '+1234567890';
  const locations = settings?.locations || ['Gatineau (Quebec)', 'Downtown Ottawa'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8 text-center">
          {t('contact.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="card p-8">
            <h2 className="text-2xl font-semibold mb-6">{t('contact.subtitle')}</h2>
            
            <div className="space-y-6">
              <a
                href={getWhatsAppLink(whatsappNumber, 'Hi! I have a question about M. Sucre cakes.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 p-4 rounded-lg hover:bg-green-50 transition-colors"
              >
                <FaWhatsapp className="text-3xl text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">{t('contact.whatsapp')}</h3>
                  <p className="text-gray-600">{whatsappNumber}</p>
                  <p className="text-sm text-green-600 mt-1">Click to chat instantly!</p>
                </div>
              </a>

              <div className="flex items-start space-x-4 p-4 rounded-lg">
                <FaPhone className="text-3xl text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">{t('contact.call')}</h3>
                  <p className="text-gray-600">{businessPhone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg">
                <FaEnvelope className="text-3xl text-purple-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">{t('contact.email')}</h3>
                  <p className="text-gray-600">info@msucre.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg">
                <FaMapMarkerAlt className="text-3xl text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">{t('contact.serviceAreas')}</h3>
                  {locations.map((location, index) => (
                    <p key={index} className="text-gray-600">{location}</p>
                  ))}
                </div>
              </div>
            </div>

            {settings?.operatingHours && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">{t('contact.hours')}</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(settings.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-gray-700">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Message Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-semibold mb-6">{t('contact.sendMessage')}</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 {t('contact.fasterResponse')}
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('checkout.name')}</label>
                <input type="text" required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('checkout.email')}</label>
                <input type="email" required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.subject')}</label>
                <input type="text" required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.message')}</label>
                <textarea rows="5" required className="input-field"></textarea>
              </div>

              <button type="submit" className="btn-primary w-full">
                {t('common.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

