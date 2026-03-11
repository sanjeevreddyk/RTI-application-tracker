import axios from 'axios';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rti_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getPathname(url = '') {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname || '';
    } catch (_error) {
      return url;
    }
  }

  return url.split('?')[0];
}

function getSuccessMessage(config, data) {
  const explicit = config?.toast?.successMessage;
  if (explicit) {
    return explicit;
  }

  const method = String(config?.method || '').toLowerCase();
  const path = getPathname(config?.url);

  if (method === 'post' && path === '/auth/login') {
    return 'Logged in successfully';
  }
  if (method === 'post' && path === '/auth/register') {
    return 'Account created successfully';
  }
  if (method === 'post' && path === '/rti') {
    return 'RTI application created';
  }
  if (method === 'put' && path.startsWith('/rti/')) {
    return 'RTI application updated';
  }
  if (method === 'delete' && path.startsWith('/rti/')) {
    return 'RTI application deleted';
  }
  if (method === 'post' && path === '/stage') {
    return 'Timeline stage saved';
  }
  if (method === 'post' && path === '/document/upload') {
    const count = Array.isArray(data) ? data.length : null;
    return count ? `${count} document(s) uploaded` : 'Document upload completed';
  }
  if (method === 'delete' && path.startsWith('/document/')) {
    return 'Document deleted';
  }
  if (method === 'post' && path === '/notes') {
    return 'Note added';
  }

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    return 'Action completed successfully';
  }

  return '';
}

function shouldToastSuccess(config) {
  if (config?.toast?.disableSuccess) {
    return false;
  }
  if (config?.toast?.forceSuccess) {
    return true;
  }

  const method = String(config?.method || '').toLowerCase();
  return ['post', 'put', 'patch', 'delete'].includes(method);
}

function shouldToastError(config) {
  return !config?.toast?.disableError;
}

apiClient.interceptors.response.use(
  (response) => {
    if (shouldToastSuccess(response.config)) {
      const message = getSuccessMessage(response.config, response.data);
      if (message) {
        showSuccessToast(message);
      }
    }
    return response;
  },
  (error) => {
    if (shouldToastError(error?.config)) {
      const message =
        error?.response?.data?.message || error?.message || 'Request failed. Please try again.';
      showErrorToast(message);
    }

    return Promise.reject(error);
  }
);

export const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';
