import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

function OrcamentoList({ orcamentos, fetchData }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [error, setError] = useState('');

  const handleEdit = (orcamento) => {
    setError('');
    setEditingId(orcamento.id);
    setFormData({
      description: orcamento.description,
      plannedAmount: orcamento.plannedAmount,
      category: orcamento.category,
      period: orcamento.period,
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setError('');
    setLoadingUpdate(true);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em OrcamentoList.handleUpdate. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingUpdate(false);
      return;
    }

    try {
      await axiosInstance.put(`/orcamentos/${id}`, {
        ...formData,
        plannedAmount: parseFloat(formData.plannedAmount),
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err.response?.data || err.message);
      setError('Erro ao atualizar orçamento. Verifique os dados ou tente novamente.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setLoadingDelete(id);

    if (!axiosInstance) {
      console.warn("axiosInstance não está pronto em OrcamentoList.handleDelete. Requisição não enviada.");
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
      setLoadingDelete(null);
      return;
    }

    if (!window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      setLoadingDelete(null);
      return;
    }

    try {
      await axiosInstance.delete(`/orcamentos/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err.response?.data || err.message);
      setError('Erro ao deletar orçamento. Por favor, tente novamente.');
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-inner bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Lista de Orçamentos</h3>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {orcamentos.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhum orçamento cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Valor Planejado</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Categoria</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Período</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((orcamento) => (
                <tr key={orcamento.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {editingId === orcamento.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="number" step="0.01" value={formData.plannedAmount} onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4">
                        <input type="text" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} className="w-full p-2 border rounded-md focus:ring-blue-400 focus:border-blue-400" />
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={(e) => handleUpdate(e, orcamento.id)} className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition disabled:opacity-50" disabled={loadingUpdate}>
                          {loadingUpdate ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition">
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-gray-700">{orcamento.description}</td>
                      <td className="py-3 px-4 text-gray-700">R${parseFloat(orcamento.plannedAmount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-700">{orcamento.category}</td>
                      <td className="py-3 px-4 text-gray-700">{orcamento.period}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button onClick={() => handleEdit(orcamento)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-yellow-600 transition">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(orcamento.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition disabled:opacity-50" disabled={loadingDelete === orcamento.id}>
                          {loadingDelete === orcamento.id ? 'Deletando...' : 'Deletar'}
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

export default OrcamentoList;