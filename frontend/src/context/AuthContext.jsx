import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import webbolsoApi from '../api/webbolsoApi';

const AuthContext = createContext(null);

// Função helper para padronizar a resposta da API
const parseApiResponse = (response) => {
  const data = response.data;
  if (Array.isArray(data)) {
    return data.filter(item => item != null && item.id != null);
  }
  if (data && data.id != null) {
    return [data];
  }
  return [];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de dados
  const [movimentos, setMovimentos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [lembretes, setLembretes] = useState([]);
  const [metas, setMetas] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // CORREÇÃO 1: Recuperar token E username do localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwtToken');
      const username = localStorage.getItem('username');
      
      if (token && username) {
        console.log("AuthContext: Token e username encontrados no localStorage.");
        webbolsoApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verifica se o token ainda é válido
        try {
          const response = await webbolsoApi.get('/auth/validate');
          
          if (response.data && response.data.valid) {
            setUser({ username, token });
            console.log("AuthContext: Token válido. Usuário autenticado:", username);
          } else {
            throw new Error('Token inválido');
          }
        } catch (error) {
          console.error("AuthContext: Token inválido ou expirado. Fazendo logout.", error);
          // Token inválido - limpa tudo
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('username');
          delete webbolsoApi.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log("AuthContext: Nenhum token/username encontrado. Usuário não autenticado.");
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // fetchAllData - carrega todos os dados
  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log("AuthContext: fetchAllData chamado sem usuário logado. Ignorando.");
      return;
    }
    
    setDataLoading(true);
    console.log("AuthContext: Iniciando fetchAllData (paralelo)...");
    
    try {
      const [
        movimentosResponse,
        emprestimosResponse,
        orcamentosResponse,
        lembretesResponse,
        metasResponse
      ] = await Promise.all([
        webbolsoApi.get('/movimentos'),
        webbolsoApi.get('/emprestimos'),
        webbolsoApi.get('/orcamentos'),
        webbolsoApi.get('/lembretes'),
        webbolsoApi.get('/metas')
      ]);

      const fetchedMovimentos = parseApiResponse(movimentosResponse);
      setMovimentos(fetchedMovimentos);
      console.log('AuthContext: Movimentos carregados:', fetchedMovimentos.length);
      
      const fetchedEmprestimos = parseApiResponse(emprestimosResponse);
      setEmprestimos(fetchedEmprestimos);
      console.log('AuthContext: Empréstimos carregados:', fetchedEmprestimos.length);

      const fetchedOrcamentos = parseApiResponse(orcamentosResponse);
      setOrcamentos(fetchedOrcamentos);
      console.log('AuthContext: Orçamentos carregados:', fetchedOrcamentos.length);

      const fetchedLembretes = parseApiResponse(lembretesResponse);
      setLembretes(fetchedLembretes);
      console.log('AuthContext: Lembretes carregados:', fetchedLembretes.length);

      const fetchedMetas = parseApiResponse(metasResponse);
      setMetas(fetchedMetas);
      console.log('AuthContext: Metas carregadas:', fetchedMetas.length);

    } catch (err) {
      console.error('AuthContext: Erro ao carregar dados:', err);
      // REMOVIDO: logout() - não chama logout aqui para evitar loops
      // Se for erro 401/403, o interceptor do axios deve lidar com isso
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // Chama fetchAllData quando o usuário estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      console.log("AuthContext: Usuário autenticado, carregando dados...");
      fetchAllData();
    }
  }, [user, loading, fetchAllData]);

  // CORREÇÃO 2: Salvar username no localStorage
  const login = async (username, password) => {
    try {
      const response = await webbolsoApi.post('/auth/login', { username, password });
      const token = response.data;

      // Salva AMBOS: token e username
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', username); // << NOVO
      
      setUser({ username, token });
      webbolsoApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log("AuthContext: Login bem-sucedido. Username:", username);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return { 
        success: false, 
        message: error.response?.data || 'Erro de autenticação' 
      };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await webbolsoApi.post('/auth/register', { 
        username, 
        password, 
        email 
      });
      console.log("AuthContext: Registro bem-sucedido:", response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('AuthContext: Erro no registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro no registro' 
      };
    }
  };

  // CORREÇÃO 3: Limpar username também no logout
  const logout = useCallback(() => {
    console.log("AuthContext: Executando logout...");
    
    // Remove do localStorage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    
    // Limpa estados
    setUser(null);
    setMovimentos([]);
    setEmprestimos([]);
    setOrcamentos([]);
    setLembretes([]);
    setMetas([]);
    
    // Remove header de autenticação
    delete webbolsoApi.defaults.headers.common['Authorization'];
    
    console.log("AuthContext: Logout concluído.");
  }, []);

  // Funções de refresh individuais
  const refreshMovimentos = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await webbolsoApi.get('/movimentos');
      const fetchedMovimentos = parseApiResponse(response);
      setMovimentos(fetchedMovimentos);
      console.log('AuthContext: Movimentos atualizados:', fetchedMovimentos.length);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar movimentos:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const refreshEmprestimos = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await webbolsoApi.get('/emprestimos');
      const fetchedEmprestimos = parseApiResponse(response);
      setEmprestimos(fetchedEmprestimos);
      console.log('AuthContext: Empréstimos atualizados:', fetchedEmprestimos.length);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar empréstimos:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const refreshOrcamentos = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await webbolsoApi.get('/orcamentos');
      const fetchedOrcamentos = parseApiResponse(response);
      setOrcamentos(fetchedOrcamentos);
      console.log('AuthContext: Orçamentos atualizados:', fetchedOrcamentos.length);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar orçamentos:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const refreshLembretes = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await webbolsoApi.get('/lembretes');
      const fetchedLembretes = parseApiResponse(response);
      setLembretes(fetchedLembretes);
      console.log('AuthContext: Lembretes atualizados:', fetchedLembretes.length);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar lembretes:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const refreshMetas = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await webbolsoApi.get('/metas');
      const fetchedMetas = parseApiResponse(response);
      setMetas(fetchedMetas);
      console.log('AuthContext: Metas atualizadas:', fetchedMetas.length);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar metas:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      movimentos,
      emprestimos,
      orcamentos,
      lembretes,
      metas,
      dataLoading, 
      refreshMovimentos,
      refreshEmprestimos,
      refreshOrcamentos,
      refreshLembretes,
      refreshMetas,
      fetchAllData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};