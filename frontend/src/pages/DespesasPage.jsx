import React, { useState, useEffect } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function DespesasPage() {
  const { despesas, dataLoading, refreshDespesas, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDespesa, setCurrentDespesa] = useState(null);
  const [form, setForm] = useState({
    description: '',
    valor: '',
    category: '',
    date: '',
  });

  useEffect(() => {
    if (user && despesas.length === 0) {
      console.log('DespesasPage: Usuário logado e despesas vazias, chamando refreshDespesas...');
      refreshDespesas();
    }
  }, [user, despesas.length, refreshDespesas]);

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
        valor: parseFloat(form.valor),
        date: form.date || new Date().toISOString().split('T')[0],
      };

      if (currentDespesa) {
        await webbolsoApi.put(`/despesas/${currentDespesa.id}`, payload);
      } else {
        await webbolsoApi.post('/despesas', payload);
      }
      
      setIsModalOpen(false);
      setForm({ description: '', valor: '', category: '', date: '' });
      setCurrentDespesa(null);
      refreshDespesas();
    } catch (err) {
      console.error('Erro ao salvar despesa:', err.response?.data || err.message);
      setError('Erro ao salvar despesa. Verifique os dados e o console para mais detalhes.');
    }
  };

  const handleEdit = (despesa) => {
    setCurrentDespesa(despesa);
    const formattedDate = despesa.date ? new Date(despesa.date).toISOString().split('T')[0] : '';
    setForm({
      description: despesa.description,
      valor: despesa.valor,
      category: despesa.category,
      date: formattedDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setError('');
      try {
        await webbolsoApi.delete(`/despesas/${id}`);
        refreshDespesas();
      } catch (err) {
        console.error('Erro ao excluir despesa:', err);
        setError('Erro ao excluir despesa.');
      }
    }
  };

  const openNewDespesaModal = () => {
    setCurrentDespesa(null);
    setForm({ description: '', valor: '', category: '', date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    { header: 'Valor', accessor: (row) => `R$ ${(row?.valor || 0).toFixed(2)}` },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
    { header: 'Data', accessor: (row) => row?.date || 'N/A' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md h-full">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">Minhas Despesas</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={openNewDespesaModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Adicionar Nova Despesa
        </button>
      </div>
      {dataLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={despesas}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentDespesa ? 'Editar Despesa' : 'Adicionar Despesa'}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={form.valor}
              onChange={handleInputChange}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DespesasPage;