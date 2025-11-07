import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './index.css';

// Set base URL for all axios requests
axios.defaults.baseURL = '/silasvitera';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename="/silasvitera">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
