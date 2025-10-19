// frontend/src/components/Auth/AuthForm.jsx

import React from 'react';

const AuthForm = ({ 
  title, 
  submitText, 
  isLoading, 
  onSubmit, 
  children,
  footer 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {submitText}...
              </div>
            ) : (
              submitText
            )}
          </button>
        </form>

        {footer && (
          <div className="mt-6 text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;