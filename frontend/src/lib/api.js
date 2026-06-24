import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

/**
 * Fetches the dashboard data (all monitored URLs with their latest health check).
 * @returns {Promise<Array>} A list of monitored URLs and status metrics.
 */
export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

/**
 * Registers a new URL for monitoring.
 * @param {string} url - The URL to register.
 * @returns {Promise<object>} The saved URL document.
 */
export const addUrl = async (url) => {
  const response = await api.post('/urls', { url });
  return response.data;
};
