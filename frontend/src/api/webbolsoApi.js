import axios from 'axios';

// Cria uma instância do Axios com a URL base do seu backend
const webbolsoApi = axios.create({
  baseURL: 'http://localhost:8080/api', // A URL base do seu backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a todas as requisições autenticadas
webbolsoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de resposta, por exemplo, token expirado
webbolsoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se for um erro 401 (Unauthorized), pode ser token expirado ou inválido
      // Aqui você pode forçar o logout do usuário
      console.warn("Erro 401: Token inválido ou expirado. Redirecionando para login.");
      localStorage.removeItem('jwtToken');
      // Redireciona para a página de login. Em uma aplicação real, você usaria um router.
      // window.location.href = '/'; // Isso forçaria um reload e levaria ao login
    }
    return Promise.reject(error);
  }
);

export default webbolsoApi;