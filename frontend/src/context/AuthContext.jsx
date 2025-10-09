import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import webbolsoApi from '../api/webbolsoApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [despesas, setDespesas] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [lembretes, setLembretes] = useState([]);
  const [metas, setMetas] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Efeito para carregar o token do localStorage ao iniciar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      console.log("AuthContext: Token encontrado no localStorage.");
      setUser({ token });
      webbolsoApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // fetchAllData é um useCallback para evitar que seja recriada em cada render
  // Sua dependência é 'user', o que faz com que ela seja recriada apenas se o objeto 'user' mudar.
  const fetchAllData = useCallback(async () => {
    if (!user) {
      console.log("AuthContext: fetchAllData chamado sem usuário logado. Ignorando.");
      return;
    }
    setDataLoading(true);
    console.log("AuthContext: Iniciando fetchAllData...");
    try {
      const despesasResponse = await webbolsoApi.get('/despesas');
      const fetchedDespesas = Array.isArray(despesasResponse.data) 
                                ? despesasResponse.data.filter(item => item != null && item.id != null)
                                : (despesasResponse.data && despesasResponse.data.id != null ? [despesasResponse.data] : []);
      setDespesas(fetchedDespesas);
      console.log('AuthContext: Dados de despesas carregados no contexto (fetchAllData):', fetchedDespesas); 
      
      const orcamentosResponse = await webbolsoApi.get('/orcamentos');
      const fetchedOrcamentos = Array.isArray(orcamentosResponse.data)
                                  ? orcamentosResponse.data.filter(item => item != null && item.id != null)
                                  : (orcamentosResponse.data && orcamentosResponse.data.id != null ? [orcamentosResponse.data] : []);
      setOrcamentos(fetchedOrcamentos);
      console.log('AuthContext: Dados de orçamentos carregados no contexto (fetchAllData):', fetchedOrcamentos);

      const lembretesResponse = await webbolsoApi.get('/lembretes');
      const fetchedLembretes = Array.isArray(lembretesResponse.data)
                                ? lembretesResponse.data.filter(item => item != null && item.id != null)
                                : (lembretesResponse.data && lembretesResponse.data.id != null ? [lembretesResponse.data] : []);
      setLembretes(fetchedLembretes);
      console.log('AuthContext: Dados de lembretes carregados no contexto (fetchAllData):', fetchedLembretes);

      const metasResponse = await webbolsoApi.get('/metas');
      const fetchedMetas = Array.isArray(metasResponse.data)
                            ? metasResponse.data.filter(item => item != null && item.id != null)
                            : (metasResponse.data && metasResponse.data.id != null ? [metasResponse.data] : []);
      setMetas(fetchedMetas);
      console.log('AuthContext: Dados de metas carregados no contexto (fetchAllData):', fetchedMetas);

    } catch (err) {
      console.error('AuthContext: Erro ao carregar todos os dados no contexto (fetchAllData):', err);
      if (err.response && err.response.status === 403) {
        logout();
      }
    } finally {
      setDataLoading(false);
      console.log("AuthContext: fetchAllData finalizado. dataLoading:", false);
    }
  }, [user]); // Esta dependência garante que fetchAllData é recriado se o 'user' mudar

  // Este useEffect agora chama fetchAllData apenas quando o 'user' é definido
  // ou quando 'loading' (do AuthContext) muda para false.
  // IMPORTANTE: 'dataLoading' foi REMOVIDO das dependências para evitar o loop.
  useEffect(() => {
    if (user && !loading) {
      console.log("AuthContext: Usuário foi definido ou carregamento inicial concluído, chamando fetchAllData.");
      fetchAllData();
    }
  }, [user, loading, fetchAllData]); // 'dataLoading' REMOVIDO daqui

  const login = async (username, password) => {
    try {
      const response = await webbolsoApi.post('/auth/login', { username, password });
      const token = response.data;

      localStorage.setItem('jwtToken', token);
      setUser({ username, token }); 
      webbolsoApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("AuthContext: Login bem-sucedido. Token JWT definido.");
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return { success: false, message: error.response?.data || 'Erro de autenticação' };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await webbolsoApi.post('/auth/register', { username, password, email });
      console.log("AuthContext: Registro bem-sucedido:", response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('AuthContext: Erro no registro:', error);
      return { success: false, message: error.response?.data?.message || 'Erro no registro' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setDespesas([]);
    setOrcamentos([]);
    setLembretes([]);
    setMetas([]);
    delete webbolsoApi.defaults.headers.common['Authorization'];
    console.log("AuthContext: Logout realizado. Token e dados removidos.");
  };

  const refreshDespesas = useCallback(async () => {
    setDataLoading(true);
    console.log("AuthContext: refreshDespesas iniciado.");
    try {
      const response = await webbolsoApi.get('/despesas');
      const fetchedDespesas = Array.isArray(response.data) 
                                ? response.data.filter(item => item != null && item.id != null)
                                : (response.data && response.data.id != null ? [response.data] : []);
      setDespesas(fetchedDespesas);
      console.log('AuthContext: Despesas recarregadas no contexto (refreshDespesas):', fetchedDespesas);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar despesas (refreshDespesas):', err);
    } finally {
      setDataLoading(false);
      console.log("AuthContext: refreshDespesas finalizado. dataLoading:", false);
    }
  }, []);

  const refreshOrcamentos = useCallback(async () => {
    setDataLoading(true);
    console.log("AuthContext: refreshOrcamentos iniciado.");
    try {
      const response = await webbolsoApi.get('/orcamentos');
      const fetchedOrcamentos = Array.isArray(response.data)
                                  ? response.data.filter(item => item != null && item.id != null)
                                  : (response.data && response.data.id != null ? [response.data] : []);
      setOrcamentos(fetchedOrcamentos);
      console.log('AuthContext: Orçamentos recarregados no contexto (refreshOrcamentos):', fetchedOrcamentos);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar orçamentos (refreshOrcamentos):', err);
    } finally {
      setDataLoading(false);
      console.log("AuthContext: refreshOrcamentos finalizado. dataLoading:", false);
    }
  }, []);

  const refreshLembretes = useCallback(async () => {
    setDataLoading(true);
    console.log("AuthContext: refreshLembretes iniciado.");
    try {
      const response = await webbolsoApi.get('/lembretes');
      const fetchedLembretes = Array.isArray(response.data)
                                ? response.data.filter(item => item != null && item.id != null)
                                : (response.data && response.data.id != null ? [response.data] : []);
      setLembretes(fetchedLembretes);
      console.log('AuthContext: Lembretes recarregados no contexto (refreshLembretes):', fetchedLembretes);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar lembretes (refreshLembretes):', err);
    } finally {
      setDataLoading(false);
      console.log("AuthContext: refreshLembretes finalizado. dataLoading:", false);
    }
  }, []);

  const refreshMetas = useCallback(async () => {
    setDataLoading(true);
    console.log("AuthContext: refreshMetas iniciado.");
    try {
      const response = await webbolsoApi.get('/metas');
      const fetchedMetas = Array.isArray(response.data)
                            ? response.data.filter(item => item != null && item.id != null)
                            : (response.data && response.data.id != null ? [response.data] : []);
      setMetas(fetchedMetas);
      console.log('AuthContext: Metas recarregadas no contexto (refreshMetas):', fetchedMetas);
    } catch (err) {
      console.error('AuthContext: Erro ao recarregar metas (refreshMetas):', err);
    } finally {
      setDataLoading(false);
      console.log("AuthContext: refreshMetas finalizado. dataLoading:", false);
    }
  }, []);


  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      despesas, 
      orcamentos,
      lembretes,
      metas,
      dataLoading, 
      refreshDespesas, 
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