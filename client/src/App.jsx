import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app/*" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

export default App;
