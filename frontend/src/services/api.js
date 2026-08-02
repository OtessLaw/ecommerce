import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
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
