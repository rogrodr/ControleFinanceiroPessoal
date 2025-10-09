import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ setCurrentPage }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 w-full sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-14 px-4">
        <h1
          className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
          onClick={() => setCurrentPage('dashboard')}
        >
          WebBolso
        </h1>
        {user ? (
          <div className="flex items-center space-x-4 text-sm font-medium">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('despesas')}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
            >
              Despesas
            </button>
            <button
              onClick={() => setCurrentPage('orcamentos')}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
            >
              Orçamentos
            </button>
            <button
              onClick={() => setCurrentPage('lembretes')}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
            >
              Lembretes
            </button>
            <button
              onClick={() => setCurrentPage('metas')}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
            >
              Metas
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentPage('login')}
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;