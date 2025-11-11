import axios from 'axios';

// Configuração da URL base da API
const getBaseURL = () => {
  // Em produção, usa a mesma URL (fullstack)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Para SSR, usa a variável de ambiente ou fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// A partir de agora, usaremos 'api' para todas as chamadas ao backend
export const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    // 2. Tentamos pegar o token de autenticação do localStorage (apenas no cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');

      // 3. Se o token existir, nós o adicionamos ao cabeçalho 'Authorization'
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 4. Retornamos a configuração modificada para que a requisição continue
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
   
    