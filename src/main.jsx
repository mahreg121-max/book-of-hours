import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Storage polyfill — replaces Claude's window.storage with localStorage
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const v = localStorage.getItem(key);
        return v ? { value: v } : null;
      } catch (e) {
        return null;
      }
    },
    set: async (key, value) => {
      try {
        localStorage.setItem(key, value);
        return { key, value };
      } catch (e) {
        return null;
      }
    },
    delete: async (key) => {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch (e) {
        return null;
      }
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
