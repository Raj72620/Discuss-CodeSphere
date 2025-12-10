// frontend/src/config/api.js

export const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || 'https://discusshub-api.vercel.app');