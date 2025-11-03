import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/translations';

/**
 * Hook to get translations based on current language
 * @param {string} path - Translation path (e.g., 'nav.home', 'home.heroTitle')
 * @returns {string} - Translated string
 */
export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (path) => {
    return getTranslation(language, path);
  };

  return { t, language };
};

export default useTranslation;

