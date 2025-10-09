import React, { useState, useEffect } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function OrcamentosPage() {
  const { orcamentos, dataLoading, refreshOrcamentos, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrcamento, setCurrentOrcamento] = useState(null);
  const [form, setForm] = useState({
    description: '',
    category: '',
    plannedAmount: '',
    period: '',
  });

  // useEffect para garantir que os dados sejam carregados se a página for acessada diretamente ou após um reload
  // 'dataLoading' foi removido das dependências para evitar loop.
  useEffect(() => {
    if (user && orcamentos.length === 0) { // Verifica apenas se usuário está logado e lista está vazia
      console.log('OrcamentosPage: Usuário logado e orçamentos vazios, chamando refreshOrcamentos...');
      refreshOrcamentos();
    }
  }, [user, orcamentos.length, refreshOrcamentos]); // 'dataLoading' REMOVIDO daqui

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        plannedAmount: parseFloat(form.plannedAmount),
      };

      if (currentOrcamento) {
        await webbolsoApi.put(`/orcamentos/${currentOrcamento.id}`, payload);
      } else {
        await webbolsoApi.post('/orcamentos', payload);
      }
      setIsModalOpen(false);
      setForm({ description: '', category: '', plannedAmount: '', period: '' });
      setCurrentOrcamento(null);
      refreshOrcamentos(); // Recarrega a lista do contexto
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err.response?.data || err.message);
      setError('Erro ao salvar orçamento. Verifique os dados.');
    }
  };

  const handleEdit = (orcamento) => {
    setCurrentOrcamento(orcamento);
    setForm({
      description: orcamento.description,
      category: orcamento.category,
      plannedAmount: orcamento.plannedAmount,
      period: orcamento.period,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      setError('');
      try {
        await webbolsoApi.delete(`/orcamentos/${id}`);
        refreshOrcamentos();
      } catch (err) {
        console.error('Erro ao excluir orçamento:', err);
        setError('Erro ao excluir orçamento.');
      }
    }
  };

  const openNewOrcamentoModal = () => {
    setCurrentOrcamento(null);
    setForm({ description: '', category: '', plannedAmount: '', period: '' });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
    { header: 'Valor Planejado', accessor: (row) => `R$ ${(row?.plannedAmount || 0).toFixed(2)}` },
    { header: 'Período', accessor: (row) => row?.period || 'N/A' },
  ];

  return (
    <div className="container mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Orçamentos</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openNewOrcamentoModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Adicionar Novo Orçamento
        </button>
      </div>

      {dataLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={orcamentos}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentOrcamento ? 'Editar Orçamento' : 'Adicionar Orçamento'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={form.category}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="plannedAmount" className="block text-sm font-medium text-gray-700">
              Valor Planejado
            </label>
            <input
              type="number"
              id="plannedAmount"
              name="plannedAmount"
              value={form.plannedAmount}
              onChange={handleInputChange}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              Período
            </label>
            <select
              id="period"
              name="period"
              value={form.period}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensal">Mensal</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OrcamentosPage;