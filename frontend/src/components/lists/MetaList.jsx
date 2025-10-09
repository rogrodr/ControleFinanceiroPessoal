import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

function MetaList({ metas, fetchData }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [error, setError] = useState('');

  const handleEdit = (meta) => {
    setError('');
    setEditingId(meta.id);
    const formattedDeadline = meta.deadline ? new Date(meta.deadline).toISOString().split('T')[0] : '';
    setFormData({
      description: meta.description,
      targetAmount: meta.targetAmount,
      category: meta.category,
      currentAmount: meta.currentAmount,
      deadline: formattedDeadline,
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setError('');
    setLoadingUpdate(true);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em MetaList.handleUpdate. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingUpdate(false);
      return;
    }

    try {
      await axiosInstance.put(`/metas/${id}`, {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: formData.deadline,
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao atualizar meta:', err.response?.data || err.message);
      setError('Erro ao atualizar meta. Verifique os dados ou tente novamente.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setLoadingDelete(id);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em MetaList.handleDelete. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingDelete(null);
      return;
    }

    if (!window.confirm('Tem certeza que deseja deletar esta meta?')) {
      setLoadingDelete(null);
      return;
    }

    try {
      await axiosInstance.delete(`/metas/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao deletar meta:', err.response?.data || err.message);
      setError('Erro ao deletar meta. Por favor, tente novamente.');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-inner bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Lista de Metas</h3>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {metas.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhuma meta cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Alvo</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Atual</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Categoria</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Prazo</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {metas.map((meta) => (
                <tr key={meta.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === meta.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" step="0.01" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={(e) => handleUpdate(e, meta.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition disabled:opacity-50" disabled={loadingUpdate}>
                          {loadingUpdate ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition">
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-gray-700">{meta.description}</td>
                      <td className="py-3 px-4 text-gray-700">R${parseFloat(meta.targetAmount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-700">R${parseFloat(meta.currentAmount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-700">{meta.category}</td>
                      <td className="py-3 px-4 text-gray-700">{meta.deadline}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={() => handleEdit(meta)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 transition">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(meta.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition disabled:opacity-50" disabled={loadingDelete === meta.id}>
                          {loadingDelete === meta.id ? 'Deletando...' : 'Deletar'}
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

export default MetaList;