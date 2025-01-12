import React from 'react';
import { AuthProvider } from './hooks/auth';
import Router from './router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App; 