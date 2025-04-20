// frontend/src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  DownloadIcon, 
  SettingsIcon, 
  StarIcon 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: <HomeIcon size={20} />, title: 'Home' },
    { path: '/downloads', icon: <DownloadIcon size={20} />, title: 'Downloads' },
    { path: '/watchlist', icon: <StarIcon size={20} />, title: 'Watchlist' },
    { path: '/settings', icon: <SettingsIcon size={20} />, title: 'Settings' },
  ];

  return (
    <div className="w-20 md:w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h1 className="hidden md:block text-lg font-bold text-gray-800 dark:text-white">M3U Downloader</h1>
          <h1 className="md:hidden text-lg font-bold text-gray-800 dark:text-white">M3U</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <div className="mr-3">{item.icon}</div>
              <span className="hidden md:inline">{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              M3U Downloader v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
