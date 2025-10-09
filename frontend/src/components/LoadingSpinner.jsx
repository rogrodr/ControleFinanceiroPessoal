import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-gray-600">Carregando...</p>
    </div>
  );
}

export default LoadingSpinner;