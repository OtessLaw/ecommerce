import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  // Automatic fallback to live Render backend for Vercel production deployments
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost')) {
    return 'https://jj-vintage-backend.onrender.com/api';
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor to inject JWT bearer token
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('luxury_user') || 'null');
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
