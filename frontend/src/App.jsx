import React, { useState, useEffect } from 'react'; // Removido useMemo, useCallback (não usados aqui)
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MovimentosPage from './pages/MovimentosPage';
import EmprestimosPage from './pages/EmprestimosPage';
import OrcamentosPage from './pages/OrcamentosPage';
import LembretesPage from './pages/LembretesPage';
import MetasPage from './pages/MetasPage';
import SimuladorPage from './pages/SimuladorPage';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();
  // Define a página inicial baseada no estado do usuário APÓS o loading inicial terminar
  const [currentPage, setCurrentPage] = useState(loading ? 'loading' : (user ? 'dashboard' : 'login'));

  // Estado para controlar dados e abertura do modal de Lembretes vindo de Movimentos
  const [initialLembreteData, setInitialLembreteData] = useState(null);
  const [isLembreteModalOpenRequest, setIsLembreteModalOpenRequest] = useState(false); // Renomeado para clareza

  // --- FUNÇÃO PARA ABRIR O MODAL (Passada para MovimentosPage - SEM setTimeout) ---
  const handleOpenLembreteModalRequest = (data) => {
    console.log("App.jsx: Recebido pedido para abrir modal de lembrete com dados:", data);
    setInitialLembreteData(data);         // Define os dados
    setIsLembreteModalOpenRequest(true);  // Sinaliza para abrir
    setCurrentPage('lembretes');        // Navega para a página
  };
  // --- FIM CORREÇÃO ---

  // --- FUNÇÃO PARA RESETAR O ESTADO QUANDO O MODAL É FECHADO (Passada para LembretesPage) ---
  const handleLembreteModalClose = () => {
    console.log("App.jsx: Recebido pedido para resetar estado do modal de lembrete.");
    setIsLembreteModalOpenRequest(false); // Reseta o sinal de abertura
    setInitialLembreteData(null);      // Limpa os dados iniciais
  };
  // --- FIM DAS MUDANÇAS PARA O MODAL DE LEMBRETES ---

  // useEffect para redirecionamento e definição da página inicial pós-loading
  useEffect(() => {
    // Só executa após o loading inicial terminar
    if (!loading) {
        const authPages = ['login', 'register'];
        if (!user) { // Se não está logado
            // Se a página atual NÃO é login/register, força para login
            if (!authPages.includes(currentPage)) {
                setCurrentPage('login');
            }
        } else { // Se está logado
            // Se a página atual é login/register OU ainda está 'loading', vai pro dashboard
            if (authPages.includes(currentPage) || currentPage === 'loading') {
                setCurrentPage('dashboard');
            }
            // Se não, mantém a página atual (pode ter sido definida por navegação)
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]); // Depende apenas de user e loading

  // Estado de Loading inicial (enquanto verifica token)
  if (loading || currentPage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Não logado - Renderiza Login ou Register
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        {currentPage === 'login' ? (
          <LoginPage onRegisterClick={() => setCurrentPage('register')} />
        ) : (
          <RegisterPage onLoginClick={() => setCurrentPage('login')} />
        )}
      </div>
    );
  }

  // Logado - Renderiza Navbar e a Página Atual
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Navbar setCurrentPage={setCurrentPage} />

      <main className="flex-grow p-4 w-full">
        {/* Usar max-w-7xl (ou similar) aqui para centralizar o conteúdo da página */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Renderização condicional de cada página */}
          {currentPage === 'dashboard' && <DashboardPage />}

          {/* MovimentosPage recebe a função para abrir o modal */}
          {currentPage === 'movimentos' && (
             <MovimentosPage onOpenLembreteModal={handleOpenLembreteModalRequest} />
          )}

          {currentPage === 'emprestimos' && <EmprestimosPage />}
          {currentPage === 'orcamentos' && <OrcamentosPage />}
          {currentPage === 'metas' && <MetasPage />}

          {/* LembretesPage recebe os dados iniciais, o sinal para abrir, e a função de reset */}
          {currentPage === 'lembretes' && (
              <LembretesPage
                  initialData={initialLembreteData}
                  isModalInitiallyOpen={isLembreteModalOpenRequest} // Passa o estado correto
                  onModalCloseRequest={handleLembreteModalClose} // Passa a função de reset
              />
          )}

          {currentPage === 'simulador' && <SimuladorPage />}

          {/* Adicionar um fallback ou página não encontrada (opcional) */}
          {/* { !['dashboard', 'movimentos', ...].includes(currentPage) && <div>Página não encontrada</div> } */}
        </div>
      </main>
    </div>
  );
}

export default App;