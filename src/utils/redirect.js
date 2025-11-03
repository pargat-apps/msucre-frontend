/**
 * Utility functions for handling redirect URLs
 * Used to redirect users back to product pages after login/registration
 */

/**
 * Save the current page URL to redirect back after login/registration
 */
export const saveRedirectUrl = (url = null) => {
  const currentUrl = url || window.location.pathname;
  localStorage.setItem('redirectAfterAuth', currentUrl);
};

/**
 * Get and clear the saved redirect URL
 */
export const getRedirectUrl = (defaultUrl = '/') => {
  const savedUrl = localStorage.getItem('redirectAfterAuth');
  if (savedUrl) {
    localStorage.removeItem('redirectAfterAuth');
    return savedUrl;
  }
  return defaultUrl;
};

/**
 * Clear the saved redirect URL
 */
export const clearRedirectUrl = () => {
  localStorage.removeItem('redirectAfterAuth');
};

