import React, { useState } from 'react';
import axiosInstance from '../../api/axiosConfig';

function OrcamentoForm({ fetchData }) {
  const [formData, setFormData] = useState({
    description: '',
    plannedAmount: '',
    category: '',
    period: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.description || !formData.plannedAmount || !formData.category || !formData.period) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/orcamentos', {
        ...formData,
        plannedAmount: parseFloat(formData.plannedAmount),
      });
      setSuccess('Orçamento cadastrado com sucesso!');
      fetchData();
      setFormData({ description: '', plannedAmount: '', category: '', period: '' });
    } catch (err) {
      console.error('Erro ao cadastrar orçamento:', err.response?.data || err.message);
      setError('Erro ao cadastrar orçamento. Verifique os dados ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cadastrar Orçamento</h3>
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
            step="0.01"
            placeholder="Valor Planejado"
            value={formData.plannedAmount}
            onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })}
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
            type="text"
            placeholder="Período (ex: Mensal, Anual)"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Adicionar Orçamento'}
        </button>
      </form>
    </div>
  );
}

export default OrcamentoForm;