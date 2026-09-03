// Central API base URL config.
// In production (e.g. Vercel), set the VITE_API_URL environment variable
// to your deployed backend URL (e.g. "https://my-portfolio-api.onrender.com").
// Locally, it defaults to using the current hostname on port 5000.
const defaultLocalUrl = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:5000` 
  : 'http://localhost:5000';

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultLocalUrl;
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
