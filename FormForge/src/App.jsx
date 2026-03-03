import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/authStore';

function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c2333',
            color: '#f8fafc',
            border: '1px solid #334155'
          }
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
