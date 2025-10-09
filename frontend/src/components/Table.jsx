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
            // Adicionado verificação para garantir que 'row' não é null/undefined
            if (!row) {
              console.warn('Item nulo encontrado na lista de dados da tabela. Pulando:', rowIndex);
              return null; // Não renderiza esta linha
            }
            // Use row.id como chave principal, garantindo que seja um valor único e estável.
            // Se row.id for null ou undefined (o que não deveria acontecer se o backend estiver ok),
            // um fallback para rowIndex é usado, mas isso pode causar problemas com reordenação/filtragem.
            // O ideal é que todos os itens do backend sempre tenham um ID.
            const rowKey = row.id != null ? row.id : `fallback-${rowIndex}`; 
            
            return (
              <tr key={rowKey} className="border-b border-gray-200 hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 px-4 text-gray-800">
                    {col.accessor(row)}
                  </td>
                ))}
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
                            // Verifica se row.id existe antes de chamar onDelete
                            if (row.id) {
                              onDelete(row.id);
                            } else {
                              console.warn('Tentativa de excluir item sem ID:', row);
                              // Opcional: mostrar um alerta ao usuário ou tratar de outra forma
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