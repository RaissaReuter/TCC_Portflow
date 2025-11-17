import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;
  
// A partir de agora, usaremos 'api' para todas as chamadas ao backend
export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  (config) => {
    // 2. Tentamos pegar o token de autenticação do localStorage (apenas no cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token encontrado no localStorage:', token ? 'SIM' : 'NÃO');

      // 3. Se o token existir, nós o adicionamos ao cabeçalho 'Authorization'
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Token adicionado ao header Authorization');
      } else {
        console.log('⚠️ Nenhum token encontrado no localStorage');
      }
    } else {
      console.log('🖥️ Executando no servidor (SSR) - sem acesso ao localStorage');
    }

    // 4. Retornamos a configuração modificada para que a requisição continue
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
   
    