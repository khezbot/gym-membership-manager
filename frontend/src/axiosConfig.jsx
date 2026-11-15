import axios from 'axios';

// Same-origin by default: in development the CRA "proxy" in package.json
// forwards /api to localhost:5001, and on EC2 Nginx forwards /api to the
// backend. So there is no hard-coded IP to change when you deploy.
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
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
