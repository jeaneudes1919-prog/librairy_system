import axios from 'axios';

// On crée une instance d'Axios avec l'URL de base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTEUR : Avant chaque requête, on vérifie si on a un token
api.interceptors.request.use((config) => {
  // On regarde dans le navigateur si un token est stocké
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Si oui, on l'ajoute dans l'en-tête "Authorization"
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;