// Central API base URL config.
// In production (e.g. Vercel), set the VITE_API_URL environment variable
// to your deployed backend URL (e.g. "https://my-portfolio-api.onrender.com").
// Locally, it defaults to http://localhost:5000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
