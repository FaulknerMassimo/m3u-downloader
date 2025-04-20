// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', center = true }) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };
  
  const spinnerClass = `animate-spin rounded-full border-t-transparent border-blue-500 ${sizeClasses[size]}`;
  
  if (center) {
    return (
      <div className="flex justify-center items-center">
        <div className={spinnerClass}></div>
      </div>
    );
  }
  
  return <div className={spinnerClass}></div>;
};

export default LoadingSpinner;
