// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa'; // Ícone de usuário

function Navbar({ setCurrentPage }) {
  const { user, logout } = useAuth();

  // Estados para os DOIS dropdowns
  const [isParcelamentosDropdownOpen, setIsParcelamentosDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // Novo estado

  // Refs para os DOIS dropdowns
  const parcelamentosDropdownRef = useRef(null);
  const userDropdownRef = useRef(null); // Nova ref

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false); // Fecha o dropdown de usuário ao sair
    setCurrentPage('login');
  };

  // Efeito GENÉRICO para fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      // Fecha dropdown de Parcelamentos se clicar fora dele
      if (parcelamentosDropdownRef.current && !parcelamentosDropdownRef.current.contains(event.target)) {
        setIsParcelamentosDropdownOpen(false);
      }
      // Fecha dropdown de Usuário se clicar fora dele
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    // Adiciona o listener
    document.addEventListener("mousedown", handleClickOutside);
    // Remove o listener ao desmontar
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Dependências vazias, as refs não mudam


  return (
    <nav className="bg-white shadow-md border-b border-gray-200 w-full sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-14 px-4 max-w-7xl">

        {/* Logo/Título */}
        <h1
            onClick={() => user ? setCurrentPage('dashboard') : setCurrentPage('login')}
            className="text-xl font-bold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
        >
            WEB BOLSO
        </h1>

        {/* Itens do Menu (se logado) */}
        {user ? (
          <div className="flex items-center space-x-2 md:space-x-4 text-sm font-medium">
            {/* Botões Normais */}
            <button onClick={() => setCurrentPage('dashboard')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">Dashboard</button>
            <button onClick={() => setCurrentPage('movimentos')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">Movimentações</button>

            {/* Dropdown Parcelamentos */}
            <div className="relative" ref={parcelamentosDropdownRef}> {/* Ref correta */}
              <button
                onClick={() => setIsParcelamentosDropdownOpen(!isParcelamentosDropdownOpen)} // Estado correto
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded hover:bg-gray-100 flex items-center"
                aria-haspopup="true"
                aria-expanded={isParcelamentosDropdownOpen} // Estado correto
              >
                Emprestimos {/* Texto atualizado */}
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isParcelamentosDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {/* Conteúdo do Dropdown Parcelamentos */}
              {isParcelamentosDropdownOpen && ( // Estado correto
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                  <button
                    onClick={() => { setCurrentPage('emprestimos'); setIsParcelamentosDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Emprestimos e Financiamentos {/* Texto atualizado */}
                  </button>
                  <button
                    onClick={() => { setCurrentPage('simulador'); setIsParcelamentosDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Simulador
                  </button>
                </div>
              )}
            </div>

            {/* Botões Normais */}
            <button onClick={() => setCurrentPage('orcamentos')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">Orçamentos</button>
            <button onClick={() => setCurrentPage('metas')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">Metas</button>
            <button onClick={() => setCurrentPage('lembretes')} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors">Lembretes</button>

             {/* --- NOVO DROPDOWN DE USUÁRIO --- */}
            <div className="relative pl-2 border-l border-gray-200" ref={userDropdownRef}> {/* Ref aqui */}
                <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} // Controla o novo estado
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors focus:outline-none" // Adicionado focus:outline-none
                    aria-haspopup="true"
                    aria-expanded={isUserDropdownOpen} // Usa o novo estado
                >
                    <FaUserCircle className="text-gray-500 text-lg" /> {/* Ícone um pouco maior */}
                    <span className="hidden sm:inline">{user.username || 'Usuário'}</span>
                    {/* Seta Opcional */}
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {/* Conteúdo do Dropdown de Usuário */}
                {isUserDropdownOpen && ( // Usa o novo estado
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                        {/* Adicionar outros links/botões aqui (Perfil, Configurações) se desejar */}
                        {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"> Meu Perfil </button> */}
                        {/* <div className="border-t border-gray-100 my-1"></div> Separador */}

                        {/* Botão Sair */}
                        <button
                            onClick={handleLogout} // Chama a função de logout
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 font-medium" // Estilo Logout
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
            {/* --- FIM DO DROPDOWN DE USUÁRIO --- */}

          </div>
        ) : (
          // Botão Login (se não logado)
          <button
              onClick={() => setCurrentPage('login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded-md transition-colors"
          >
              Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;