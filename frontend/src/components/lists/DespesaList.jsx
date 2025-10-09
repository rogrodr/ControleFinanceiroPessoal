import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

function DespesaList({ despesas, fetchData }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [error, setError] = useState('');

  const handleEdit = (despesa) => {
    setError('');
    setEditingId(despesa.id);
    // Assegura que a data está no formato YYYY-MM-DD para o input type="date"
    const formattedDate = despesa.date ? new Date(despesa.date).toISOString().split('T')[0] : '';
    setFormData({
      description: despesa.description,
      valor: despesa.valor,
      category: despesa.category,
      date: formattedDate,
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setError('');
    setLoadingUpdate(true);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em DespesaList.handleUpdate. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingUpdate(false);
      return;
    }

    try {
      await axiosInstance.put(`/despesas/${id}`, {
        ...formData,
        valor: parseFloat(formData.valor),
        date: formData.date // LocalDate no backend aceita YYYY-MM-DD string
      });
      setEditingId(null);
      fetchData(); // Atualiza os dados na página pai
    } catch (err) {
      console.error('Erro ao atualizar despesa:', err.response?.data || err.message);
      setError('Erro ao atualizar despesa. Verifique os dados ou tente novamente.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setLoadingDelete(id);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em DespesaList.handleDelete. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingDelete(null);
      return;
    }

    if (!window.confirm('Tem certeza que deseja deletar esta despesa?')) {
      setLoadingDelete(null);
      return;
    }

    try {
      await axiosInstance.delete(`/despesas/${id}`);
      fetchData(); // Atualiza os dados na página pai
    } catch (err) {
      console.error('Erro ao deletar despesa:', err.response?.data || err.message);
      setError('Erro ao deletar despesa. Por favor, tente novamente.');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-inner bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Lista de Despesas</h3>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {despesas.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhuma despesa cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto"> {/* Permite rolagem horizontal em telas pequenas */}
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Valor</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Categoria</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Data</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((despesa) => (
                <tr key={despesa.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === despesa.id ? (
                    // Modo de edição
                    <>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={(e) => handleUpdate(e, despesa.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition disabled:opacity-50" disabled={loadingUpdate}>
                          {loadingUpdate ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition">
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    // Modo de visualização
                    <>
                      <td className="py-3 px-4 text-gray-700">{despesa.description}</td>
                      <td className="py-3 px-4 text-gray-700">R${parseFloat(despesa.valor).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-700">{despesa.category}</td>
                      <td className="py-3 px-4 text-gray-700">{despesa.date}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={() => handleEdit(despesa)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 transition">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(despesa.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition disabled:opacity-50" disabled={loadingDelete === despesa.id}>
                          {loadingDelete === despesa.id ? 'Deletando...' : 'Deletar'}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DespesaList;