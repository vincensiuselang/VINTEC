
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
// halaman admin (plus supabase-js) cuma dimuat kalau buka /admin
const AdminPage = lazy(() => import('./src/pages/AdminPage'));

const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
