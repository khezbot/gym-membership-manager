import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // switched to same-origin /api in GMM-13
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT from the logged-in user to every request.
axiosInstance.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('gymUser'));
    if (stored && stored.token) config.headers.Authorization = `Bearer ${stored.token}`;
  } catch (e) {
    /* ignore unreadable storage */
  }
  return config;
});

// Turn API errors into one readable message for the UI.
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  (error && error.response && error.response.data && error.response.data.message) || fallback;

export default axiosInstance;