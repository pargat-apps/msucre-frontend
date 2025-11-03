import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-600 mb-4">{message || 'An error occurred. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

