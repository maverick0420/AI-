import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Layout from '../components/Layout';
import Live from '../pages/Live';
import Studio from '../pages/Studio';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Recharge from '../pages/Recharge';
import Login from '../pages/Login';
import Register from '../pages/Register';

const Router: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live/:id?" element={<Live />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/recharge" element={<Recharge />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  );
};

export default Router; 