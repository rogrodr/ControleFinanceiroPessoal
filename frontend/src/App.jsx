import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DespesasPage from './pages/DespesasPage';
import OrcamentosPage from './pages/OrcamentosPage';
import LembretesPage from './pages/LembretesPage';
import MetasPage from './pages/MetasPage';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (!loading && !user) {
      setCurrentPage('login');
    } else if (!loading && user) {
      setCurrentPage('dashboard');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        Carregando...
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Navbar setCurrentPage={setCurrentPage} />
      <main className="flex-grow p-4 w-full">
        <div className="w-full">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'despesas' && <DespesasPage />}
          {currentPage === 'orcamentos' && <OrcamentosPage />}
          {currentPage === 'lembretes' && <LembretesPage />}
          {currentPage === 'metas' && <MetasPage />}
        </div>
      </main>
    </div>
  );
}

export default App;