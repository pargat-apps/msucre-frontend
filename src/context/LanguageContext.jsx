import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('websiteLanguage');
    return savedLanguage || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('websiteLanguage', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'fr') {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    isEnglish: language === 'en',
    isFrench: language === 'fr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

