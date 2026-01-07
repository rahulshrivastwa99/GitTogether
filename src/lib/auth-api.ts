import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const login = (data: any) => API.post('/login', data);
export const signup = (data: any) => API.post('/signup', data);