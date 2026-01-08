import axios from 'axios';

// This pulls the URL from your .env file automatically
const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL 
});

export const login = (data: any) => API.post('/login', data);
export const signup = (data: any) => API.post('/signup', data);

// Add other requests here too
export const getMatches = () => API.get('/matches');