import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig'; // Importa a instância configurada

function DespesaForm({ fetchData }) {
  const [formData, setFormData] = useState({
    description: '',
    valor: '',
    category: '',
    date: '', // Formato YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.description || !formData.valor || !formData.category || !formData.date) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/despesas', {
        ...formData,
        valor: parseFloat(formData.valor), // Garante que 'valor' é um número
        date: formData.date // LocalDate no backend aceita YYYY-MM-DD string
      });
      setSuccess('Despesa cadastrada com sucesso!');
      fetchData(); // Atualiza os dados na página pai
      setFormData({ description: '', valor: '', category: '', date: '' }); // Limpa o formulário
    } catch (err) {
      console.error('Erro ao cadastrar despesa:', err.response?.data || err.message);
      setError('Erro ao cadastrar despesa. Verifique os dados ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cadastrar Despesa</h3>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            step="0.01" // Permite valores decimais
            placeholder="Valor"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Adicionar Despesa'}
        </button>
      </form>
    </div>
  );
}

export default DespesaForm;