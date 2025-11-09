import axios from 'axios';

// Pega a URL base da API a partir das variáveis de ambiente que criamos no .env.local
const baseURL = process.env.NEXT_PUBLIC_API_URL;

// A partir de agora, usaremos 'api' para todas as chamadas ao backend
export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }

    // 2. Tentamos pegar o token de autenticação do localStorage
    const token = localStorage.getItem('authToken');

    // 3. Se o token existir, nós o adicionamos ao cabeçalho 'Authorization'
    if (token) {
    
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 4. Retornamos a configuração modificada para que a requisição continue
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);
   
    