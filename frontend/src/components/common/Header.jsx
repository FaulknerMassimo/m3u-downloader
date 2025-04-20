// frontend/src/components/common/Header.jsx
import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Header;
