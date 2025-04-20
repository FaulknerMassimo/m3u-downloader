// frontend/src/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import Watchlist from './pages/Watchlist';

const AppRoutes = ({ settings, setSettings }) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/downloads" element={<Downloads />} />
      <Route 
        path="/settings" 
        element={<Settings settings={settings} setSettings={setSettings} />} 
      />
      <Route 
        path="/watchlist" 
        element={<Watchlist settings={settings} setSettings={setSettings} />} 
      />
    </Routes>
  );
};

export default AppRoutes;
