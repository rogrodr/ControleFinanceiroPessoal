import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

function LembreteList({ lembretes, fetchData }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [error, setError] = useState('');

  const handleEdit = (lembrete) => {
    setError('');
    setEditingId(lembrete.id);
    const formattedDate = lembrete.dueDate ? new Date(lembrete.dueDate).toISOString().split('T')[0] : '';
    setFormData({
      description: lembrete.description,
      dueDate: formattedDate,
      category: lembrete.category,
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setError('');
    setLoadingUpdate(true);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em LembreteList.handleUpdate. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingUpdate(false);
      return;
    }

    try {
      await axiosInstance.put(`/lembretes/${id}`, formData);
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao atualizar lembrete:', err.response?.data || err.message);
      setError('Erro ao atualizar lembrete. Verifique os dados ou tente novamente.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setLoadingDelete(id);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em LembreteList.handleDelete. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingDelete(null);
      return;
    }

    if (!window.confirm('Tem certeza que deseja deletar este lembrete?')) {
      setLoadingDelete(null);
      return;
    }

    try {
      await axiosInstance.delete(`/lembretes/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao deletar lembrete:', err.response?.data || err.message);
      setError('Erro ao deletar lembrete. Por favor, tente novamente.');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-inner bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Lista de Lembretes</h3>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {lembretes.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhum lembrete cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Data de Vencimento</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Categoria</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lembretes.map((lembrete) => (
                <tr key={lembrete.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === lembrete.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={(e) => handleUpdate(e, lembrete.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition disabled:opacity-50" disabled={loadingUpdate}>
                          {loadingUpdate ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition">
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-gray-700">{lembrete.description}</td>
                      <td className="py-3 px-4 text-gray-700">{lembrete.dueDate}</td>
                      <td className="py-3 px-4 text-gray-700">{lembrete.category}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={() => handleEdit(lembrete)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 transition">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(lembrete.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition disabled:opacity-50" disabled={loadingDelete === lembrete.id}>
                          {loadingDelete === lembrete.id ? 'Deletando...' : 'Deletar'}
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

export default LembreteList;