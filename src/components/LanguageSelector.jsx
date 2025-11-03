import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaGlobe } from 'react-icons/fa';

const LanguageSelector = ({ className = '' }) => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center gap-2">
        <FaGlobe className="text-gray-600" />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer appearance-none pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;

