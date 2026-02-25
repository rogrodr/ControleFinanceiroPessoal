import React, { useEffect, useCallback } from 'react';

// Componente Modal genérico
function Modal({ isOpen, onClose, title, children }) {
  // Fecha o modal ao pressionar ESC
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Adiciona listener para ESC e bloqueia scroll do body
  useEffect(() => {
    if (isOpen) {
      // Bloqueia scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
      
      // Adiciona listener para tecla ESC
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        // Remove bloqueio de scroll
        document.body.style.overflow = 'unset';
        
        // Remove listener
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, handleEscapeKey]);

  // Previne fechar ao clicar dentro do modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    // Overlay de fundo - fecha ao clicar fora
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Container principal do modal */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 relative flex flex-col max-h-[90vh]"
        onClick={handleModalClick}
      >
        {/* Cabeçalho com título e botão de fechar */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-semibold leading-none transition-colors duration-150"
            aria-label="Fechar modal"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Área de conteúdo rolável */}
        <div className="overflow-y-auto flex-grow pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;