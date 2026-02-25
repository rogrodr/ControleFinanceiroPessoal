import React, { useState, useEffect, useMemo } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function MetasPage() {
  // Usa 'movimentos' do context para gerar categorias
  const { metas, movimentos, dataLoading, refreshMetas, user } = useAuth();

  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMeta, setCurrentMeta] = useState(null);

  // Estado inicial do formulário completo
  const getInitialFormState = () => ({
    description: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: '',
    categoriaAssociada: '',
  });

  const [form, setForm] = useState(getInitialFormState());

  // Efeito para buscar metas iniciais se necessário
  useEffect(() => {
    if (user && metas.length === 0 && !dataLoading.metas) { // Verifica loading específico
      refreshMetas();
    }
  }, [user, metas.length, refreshMetas, dataLoading.metas]);

  // Gera a lista de categorias de receita a partir dos movimentos
  const categoriasDeReceita = useMemo(() => {
    if (!Array.isArray(movimentos)) {
      console.warn("MetasPage: 'movimentos' não é um array ou está indefinido.");
      return [];
    }
    const categorias = movimentos
      .filter(movimento => movimento.tipo === 'RECEITA' && movimento.category) // Garante que a categoria exista
      .map(movimento => movimento.category);
    return [...new Set(categorias)].sort(); // Ordena alfabeticamente
  }, [movimentos]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Validações básicas opcionais no frontend
      if (parseFloat(form.currentAmount) > parseFloat(form.targetAmount)) {
          setError('O valor atual não pode ser maior que o valor alvo.');
          return;
      }
       if (!form.description || !form.targetAmount || !form.currentAmount || !form.category) {
           setError('Por favor, preencha todos os campos obrigatórios.');
           return;
       }


      const payload = {
        description: form.description,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount),
        category: form.category,
        // Envia null se a data não for preenchida
        deadline: form.deadline ? form.deadline : null,
        // Envia null se a categoria associada estiver vazia
        categoriaAssociada: form.categoriaAssociada ? form.categoriaAssociada : null,
      };

      if (currentMeta) {
        await webbolsoApi.put(`/metas/${currentMeta.id}`, payload);
      } else {
        await webbolsoApi.post('/metas', payload);
      }
      setIsModalOpen(false);
      setForm(getInitialFormState());
      setCurrentMeta(null);
      refreshMetas(); // Atualiza a lista de metas
    } catch (err) {
      console.error('Erro ao salvar meta:', err.response?.data || err.message);
      setError(`Erro ao salvar meta: ${err.response?.data?.message || err.message || 'Verifique os dados.'}`);
    }
  };

  const handleEdit = (meta) => {
    setCurrentMeta(meta);
    // Formata a data corretamente para o input type="date"
    const formattedDate = meta.deadline ? new Date(meta.deadline).toISOString().split('T')[0] : '';
    setForm({
      description: meta.description || '',
      targetAmount: meta.targetAmount || '',
      currentAmount: meta.currentAmount || '',
      category: meta.category || '',
      deadline: formattedDate,
      categoriaAssociada: meta.categoriaAssociada || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      setError('');
      try {
        await webbolsoApi.delete(`/metas/${id}`);
        refreshMetas(); // Atualiza a lista após excluir
      } catch (err) {
        console.error('Erro ao excluir meta:', err);
        setError('Erro ao excluir meta.');
      }
    }
  };

  const openNewMetaModal = () => {
    setCurrentMeta(null);
    setForm(getInitialFormState()); // Limpa o formulário
    setError(''); // Limpa erros anteriores
    setIsModalOpen(true);
  };

  // Definição das colunas da tabela
  const columns = [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    {
      header: 'Progresso',
      accessor: (row) => row, // Passa a linha inteira para o cell poder calcular
      cell: (_, row) => { // Ignora o 'value' (que seria a row inteira), usa 'row' diretamente
        const current = row?.currentAmount || 0;
        const target = row?.targetAmount || 0;
        const perc = (target > 0) ? Math.min((current / target) * 100, 100) : 0;
        return (
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700" title={`R$ ${current.toFixed(2)} / R$ ${target.toFixed(2)}`}>
            <div
              className="bg-blue-600 h-4 rounded-full text-xs font-medium text-blue-100 text-center leading-none" // Ajustado 'leading'
              style={{ width: `${perc}%` }}
              aria-valuenow={perc}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {perc > 10 ? `${perc.toFixed(0)}%` : ''} {/* Mostra % se for maior q 10% */}
            </div>
          </div>
        );
      }
    },
    { header: 'Atual', accessor: (row) => `R$ ${(row?.currentAmount || 0).toFixed(2)}` },
    { header: 'Meta', accessor: (row) => `R$ ${(row?.targetAmount || 0).toFixed(2)}` },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
    {
      header: 'Data Limite',
      accessor: (row) => row?.deadline, // Passa a data crua
      cell: (value) => value ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A' // Formata a data
    },
  ];

  // Determina o estado de loading combinado
  const isLoading = dataLoading.metas || dataLoading.movimentos; // Considera ambos os loadings do context

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Minhas Metas</h1>
        <button
          onClick={openNewMetaModal}
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
        >
          Adicionar Nova Meta
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error && !isModalOpen ? ( // Só mostra o erro principal se o modal estiver fechado
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={metas || []} // Garante que data seja sempre um array
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal - Renderiza mesmo que haja erro na lista principal para permitir correções */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentMeta ? 'Editar Meta' : 'Adicionar Meta'}
      >
        {/* FORMULÁRIO COMPLETO E CORRIGIDO DENTRO DO MODAL */}
        <form onSubmit={handleSave} className="space-y-4">

          {/* Mensagem de erro específica do modal */}
          {error && isModalOpen && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
            <input
              type="text" id="description" name="description" value={form.description} onChange={handleInputChange} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Valores Atual/Alvo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">Valor Atual (R$) *</label>
              <input
                type="number" id="currentAmount" name="currentAmount" value={form.currentAmount} onChange={handleInputChange} step="0.01" required min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">Valor Alvo (R$) *</label>
              <input
                type="number" id="targetAmount" name="targetAmount" value={form.targetAmount} onChange={handleInputChange} step="0.01" required min="0.01" // Meta deve ser > 0
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Categoria da Meta */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria da Meta *</label>
            <input
              type="text" id="category" name="category" value={form.category} onChange={handleInputChange} required
              placeholder="Ex: Economia, Lazer, Educação"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Categoria Associada (com Datalist) */}
          <div>
            <label htmlFor="categoriaAssociada" className="block text-sm font-medium text-gray-700">
              Contribuir Auto. com Receitas da Categoria:
            </label>
            <input
              list="categorias-receita-list" id="categoriaAssociada" name="categoriaAssociada" value={form.categoriaAssociada} onChange={handleInputChange}
              placeholder="Digite ou selecione (Ex: Salário)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <datalist id="categorias-receita-list">
              {categoriasDeReceita.map(cat => ( <option key={cat} value={cat} /> ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-500">
              Opcional. Se preenchido, receitas recebidas nesta categoria aumentarão o 'Valor Atual' desta meta.
            </p>
          </div>

          {/* Data Limite */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Data Limite</label>
            <input
              type="date" id="deadline" name="deadline" value={form.deadline} // Formato YYYY-MM-DD
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Botões Salvar/Cancelar */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button" onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MetasPage;