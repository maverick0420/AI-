import React from 'react';
import { AuthProvider } from './hooks';
import Layout from './components/Layout';
import Router from './router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout>
        <Router />
      </Layout>
    </AuthProvider>
  );
};

export default App; 