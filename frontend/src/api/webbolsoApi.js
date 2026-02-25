import axios from 'axios';

const webbolsoApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para lidar com erros de autenticação
webbolsoApi.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, apenas retorna
    return response;
  },
  (error) => {
    // Se houver erro 401 (Unauthorized) ou 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('webbolsoApi: Token inválido ou expirado. Redirecionando para login...');
      
      // Limpa o localStorage
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      
      // Remove o header de autorização
      delete webbolsoApi.defaults.headers.common['Authorization'];
      
      // Redireciona para a página de login
      window.location.href = '/login';
    }
    
    // Rejeita a promise para que o erro possa ser tratado no catch
    return Promise.reject(error);
  }
);

export default webbolsoApi;