import React, { useState, useEffect } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function MetasPage() {
  const { metas, dataLoading, refreshMetas, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMeta, setCurrentMeta] = useState(null);
  const [form, setForm] = useState({
    description: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: '',
  });

  // useEffect para garantir que os dados sejam carregados se a página for acessada diretamente ou após um reload
  // 'dataLoading' foi removido das dependências para evitar loop.
  useEffect(() => {
    if (user && metas.length === 0) { // Verifica apenas se usuário está logado e lista está vazia
      console.log('MetasPage: Usuário logado e metas vazias, chamando refreshMetas...');
      refreshMetas();
    }
  }, [user, metas.length, refreshMetas]); // 'dataLoading' REMOVIDO daqui

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
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount),
        deadline: form.deadline || new Date().toISOString().split('T')[0],
      };

      if (currentMeta) {
        await webbolsoApi.put(`/metas/${currentMeta.id}`, payload);
      } else {
        await webbolsoApi.post('/metas', payload);
      }
      setIsModalOpen(false);
      setForm({ description: '', targetAmount: '', currentAmount: '', category: '', deadline: '' });
      setCurrentMeta(null);
      refreshMetas(); // Recarrega a lista do contexto
    } catch (err) {
      console.error('Erro ao salvar meta:', err.response?.data || err.message);
      setError('Erro ao salvar meta. Verifique os dados.');
    }
  };

  const handleEdit = (meta) => {
    setCurrentMeta(meta);
    const formattedDeadline = meta.deadline ? new Date(meta.deadline).toISOString().split('T')[0] : '';
    setForm({
      description: meta.description,
      targetAmount: meta.targetAmount,
      currentAmount: meta.currentAmount,
      category: meta.category,
      deadline: formattedDeadline,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      setError('');
      try {
        await webbolsoApi.delete(`/metas/${id}`);
        refreshMetas();
      } catch (err) {
        console.error('Erro ao excluir meta:', err);
        setError('Erro ao excluir meta.');
      }
    }
  };

  const openNewMetaModal = () => {
    setCurrentMeta(null);
    setForm({ description: '', targetAmount: '', currentAmount: '', category: '', deadline: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    { header: 'Valor Alvo', accessor: (row) => `R$ ${(row?.targetAmount || 0).toFixed(2)}` },
    { header: 'Valor Atual', accessor: (row) => `R$ ${(row?.currentAmount || 0).toFixed(2)}` },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
    { header: 'Prazo', accessor: (row) => row?.deadline || 'N/A' },
  ];

  return (
    <div className="container mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Minhas Metas</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openNewMetaModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Adicionar Nova Meta
        </button>
      </div>

      {dataLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={metas}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentMeta ? 'Editar Meta' : 'Adicionar Meta'}
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
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
              Valor Alvo
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleInputChange}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
              Valor Atual
            </label>
            <input
              type="number"
              id="currentAmount"
              name="currentAmount"
              value={form.currentAmount}
              onChange={handleInputChange}
              step="0.01"
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
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Prazo
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={form.deadline}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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

export default MetasPage;