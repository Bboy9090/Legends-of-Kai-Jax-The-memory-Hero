import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@capacitor/app';

const MobileApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Legends of Kai-Jax: The Memory Hero</h1>
      <p>Mobile app coming soon...</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileApp />
  </React.StrictMode>
);

