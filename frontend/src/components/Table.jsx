// src/components/Table.js

import React from 'react';

// Componente genérico para exibição de tabelas
function Table({ data, columns, onEdit, onDelete }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">Nenhum dado para exibir.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="py-3 px-4 text-left font-semibold">
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="py-3 px-4 text-center font-semibold">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            if (!row) {
              console.warn('Item nulo encontrado na lista de dados da tabela. Pulando:', rowIndex);
              return null; 
            }
            const rowKey = row.id != null ? row.id : `fallback-${rowIndex}`; 
            
            return (
              <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50">
                {columns.map((col, colIndex) => {
                  // --- ATUALIZAÇÃO AQUI ---
                  // Pega o valor usando o accessor
                  const value = col.accessor(row);
                  
                  return (
                    <td key={colIndex} className="py-3 px-4 text-gray-800">
                      {/* Verifica se a coluna tem um renderizador 'cell' customizado.
                        Se tiver, usa ele. Senão, usa só o valor do 'accessor'.
                        Isso permite que as colunas 'Tipo' e 'Valor' em movimentosPage
                        sejam renderizadas de forma customizada (com cores).
                      */}
                      {col.cell ? col.cell(value, row) : value}
                    </td>
                  );
                  // --- FIM DA ATUALIZAÇÃO ---
                })}

                {(onEdit || onDelete) && (
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (row.id) {
                              onDelete(row.id);
                            } else {
                              console.warn('Tentativa de excluir item sem ID:', row);
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition duration-200 text-sm"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;