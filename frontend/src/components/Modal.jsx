import React from 'react';

// Componente Modal genérico
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-semibold"
        >
          &times;
        </button>
        <div className="py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;