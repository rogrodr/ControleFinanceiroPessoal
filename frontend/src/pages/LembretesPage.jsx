import React, { useState, useEffect } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function LembretesPage() {
  const { lembretes, dataLoading, refreshLembretes, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLembrete, setCurrentLembrete] = useState(null);
  const [form, setForm] = useState({
    description: '',
    dueDate: '',
    category: '',
  });

  // useEffect para garantir que os dados sejam carregados se a página for acessada diretamente ou após um reload
  // 'dataLoading' foi removido das dependências para evitar loop.
  useEffect(() => {
    if (user && lembretes.length === 0) { // Verifica apenas se usuário está logado e lista está vazia
      console.log('LembretesPage: Usuário logado e lembretes vazios, chamando refreshLembretes...');
      refreshLembretes();
    }
  }, [user, lembretes.length, refreshLembretes]); // 'dataLoading' REMOVIDO daqui

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
        dueDate: form.dueDate || new Date().toISOString().split('T')[0],
      };

      if (currentLembrete) {
        await webbolsoApi.put(`/lembretes/${currentLembrete.id}`, payload);
      } else {
        await webbolsoApi.post('/lembretes', payload);
      }
      setIsModalOpen(false);
      setForm({ description: '', dueDate: '', category: '' });
      setCurrentLembrete(null);
      refreshLembretes(); // Recarrega a lista do contexto
    } catch (err) {
      console.error('Erro ao salvar lembrete:', err.response?.data || err.message);
      setError('Erro ao salvar lembrete. Verifique os dados.');
    }
  };

  const handleEdit = (lembrete) => {
    setCurrentLembrete(lembrete);
    const formattedDate = lembrete.dueDate ? new Date(lembrete.dueDate).toISOString().split('T')[0] : '';
    setForm({
      description: lembrete.description,
      dueDate: formattedDate,
      category: lembrete.category,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      setError('');
      try {
        await webbolsoApi.delete(`/lembretes/${id}`);
        refreshLembretes();
      } catch (err) {
        console.error('Erro ao excluir lembrete:', err);
        setError('Erro ao excluir lembrete.');
      }
    }
  };

  const openNewLembreteModal = () => {
    setCurrentLembrete(null);
    setForm({ description: '', dueDate: new Date().toISOString().split('T')[0], category: '' });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    { header: 'Data de Vencimento', accessor: (row) => row?.dueDate || 'N/A' },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
  ];

  return (
    <div className="container mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Lembretes</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openNewLembreteModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Adicionar Novo Lembrete
        </button>
      </div>

      {dataLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={lembretes}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentLembrete ? 'Editar Lembrete' : 'Adicionar Lembrete'}
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
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Data de Vencimento
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={form.dueDate}
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

export default LembretesPage;