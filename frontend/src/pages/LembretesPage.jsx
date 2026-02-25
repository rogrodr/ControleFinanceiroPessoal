import React, { useState, useEffect, useMemo, useCallback } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaEdit, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';

function LembretesPage({ initialData, isModalInitiallyOpen, onModalCloseRequest }) {
  console.log("LembretesPage: Montado/Atualizado. Props:", "initialData=", JSON.stringify(initialData), "isModalInitiallyOpen=", isModalInitiallyOpen);

  const { lembretes, dataLoading, refreshLembretes, user } = useAuth();
  const [error, setError] = useState('');
  const [currentLembrete, setCurrentLembrete] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('PENDENTE');

  // Função getInitialFormState
  const getInitialFormState = useCallback((data = null) => ({
    description: data?.description || '',
    dueDate: data?.dueDate || new Date().toISOString().split('T')[0],
    category: data?.category || '',
    movimentoId: data?.movimentoId || null,
  }), []);

  // Inicialização dos Estados Locais
  const [isModalOpen, setIsModalOpen] = useState(() => {
    const shouldOpen = isModalInitiallyOpen && initialData;
    console.log(`LembretesPage: Estado INICIAL de isModalOpen definido como ${shouldOpen}.`);
    return shouldOpen;
  });
  
  const [form, setForm] = useState(() => {
    const formData = (isModalInitiallyOpen && initialData) ? getInitialFormState(initialData) : getInitialFormState();
    console.log("LembretesPage: Estado INICIAL do form definido com:", JSON.stringify(formData));
    return formData;
  });

  // CORRIGIDO: useEffect para carregar a lista de lembretes
  useEffect(() => {
    const isLoadingLembretes = typeof dataLoading === 'object' ? dataLoading.lembretes : dataLoading;
    if (user && Array.isArray(lembretes) && lembretes.length === 0 && !isLoadingLembretes) {
      console.log("LembretesPage: Disparando busca inicial de lembretes.");
      refreshLembretes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, lembretes?.length, refreshLembretes, dataLoading?.lembretes]);

  // useEffect para reagir a mudanças nas props (apenas quando vêm de fora)
  useEffect(() => {
    console.log("LembretesPage: useEffect [isModalInitiallyOpen, initialData] disparado.");
    
    // Apenas abre o modal se vier de props externas (initialData presente)
    if (isModalInitiallyOpen && initialData) {
      console.log("LembretesPage: Abrindo modal com dados iniciais das props.");
      setCurrentLembrete(null);
      setForm(getInitialFormState(initialData));
      setIsModalOpen(true);
      setError('');
    }
  }, [isModalInitiallyOpen, initialData, getInitialFormState]);

  // --- HANDLERS ---
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log("LembretesPage: handleCloseModal chamado.");
    setIsModalOpen(false);
    setCurrentLembrete(null);
    setForm(getInitialFormState());
    setError('');
    
    if (onModalCloseRequest) {
      console.log("LembretesPage: Chamando onModalCloseRequest.");
      onModalCloseRequest();
    }
  }, [onModalCloseRequest, getInitialFormState]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!form.description || !form.dueDate) {
        setError("Descrição e Data são obrigatórios.");
        return;
      }

      const payload = {
        description: form.description,
        dueDate: form.dueDate,
        category: form.category || 'Geral',
        movimentoId: form.movimentoId || null
      };

      console.log('Payload sendo enviado:', payload);
      console.log('Data no formato:', form.dueDate, typeof form.dueDate);

      if (currentLembrete) {
        await webbolsoApi.put(`/lembretes/${currentLembrete.id}`, payload);
      } else {
        await webbolsoApi.post('/lembretes', payload);
      }

      handleCloseModal();
      refreshLembretes();
    } catch (err) {
      console.error('Erro ao salvar lembrete:', err.response?.data || err.message);
      
      if (err.response?.status === 500) {
        setError(`Erro interno no servidor (500). Verifique logs do backend.`);
      } else {
        setError(`Erro ao salvar: ${err.response?.data?.message || err.message || 'Verifique os dados.'}`);
      }
    }
  }, [form, currentLembrete, handleCloseModal, refreshLembretes]);

  const handleEdit = useCallback((lembrete) => {
    if (!lembrete) return;
    
    setCurrentLembrete(lembrete);
    
    // LocalDate vem como array [ano, mês, dia] do backend
    let formattedDate = '';
    if (lembrete.dueDate) {
      if (Array.isArray(lembrete.dueDate) && lembrete.dueDate.length === 3) {
        const [year, month, day] = lembrete.dueDate;
        // Formata para YYYY-MM-DD (formato do input[type="date"])
        formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (typeof lembrete.dueDate === 'string') {
        formattedDate = lembrete.dueDate;
      }
    }
    
    setForm({
      description: lembrete.description || '',
      dueDate: formattedDate,
      category: lembrete.category || '',
      movimentoId: lembrete.movimentoId || null
    });
    setError('');
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Excluir PERMANENTEMENTE este lembrete?')) return;
    
    setError('');
    try {
      await webbolsoApi.delete(`/lembretes/${id}`);
      refreshLembretes();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      setError('Erro ao excluir lembrete.');
    }
  }, [refreshLembretes]);

  const openNewLembreteModal = useCallback(() => {
    setCurrentLembrete(null);
    setForm(getInitialFormState());
    setError('');
    setIsModalOpen(true);
  }, [getInitialFormState]);

  const handleComplete = useCallback(async (id) => {
    console.log(`Marcando lembrete ${id} como concluído...`);
    
    try {
      await webbolsoApi.patch(`/lembretes/${id}/concluir`);
      refreshLembretes();
    } catch (err) {
      console.error('Erro ao concluir:', err.response?.data || err.message);
      alert(`Erro: ${err.response?.data?.message || err.message}`);
    }
  }, [refreshLembretes]);

  // --- Definição das Colunas ---
  const columns = useMemo(() => [
    {
      header: 'Descrição',
      accessor: (row) => row?.description || 'N/A'
    },
    {
      header: 'Data Venc.',
      accessor: (row) => row?.dueDate,
      cell: (value, row) => {
        if (!value) return 'N/A';
        
        try {
          let year, month, day;
          
          // LocalDate do Java vem serializado como array [ano, mês, dia]
          if (Array.isArray(value) && value.length === 3) {
            [year, month, day] = value;
          } 
          // Fallback: se vier como string "YYYY-MM-DD"
          else if (typeof value === 'string') {
            [year, month, day] = value.split('-').map(Number);
          }
          // Fallback: se vier como objeto {year, monthValue, dayOfMonth}
          else if (typeof value === 'object' && value !== null) {
            year = value.year || value.yearValue;
            month = value.month || value.monthValue;
            day = value.day || value.dayOfMonth;
          } else {
            console.error('Formato de data desconhecido:', value);
            return 'Data Inválida';
          }
          
          // Valida os valores
          if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
            console.error('Valores de data inválidos:', { year, month, day, value });
            return 'Data Inválida';
          }
          
          // Cria a data (mês em Java é 1-12, em JS é 0-11)
          const date = new Date(year, month - 1, day);
          
          if (isNaN(date.getTime())) {
            console.error('Data inválida após conversão:', value);
            return 'Data Inválida';
          }
          
          const dateStr = date.toLocaleDateString('pt-BR');
          const isConcluido = row?.status === 'CONCLUIDO';
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDateOnly = new Date(year, month - 1, day);
          const isAtrasado = !isConcluido && dueDateOnly < today;
          
          let className = '';
          if (isConcluido) {
            className = 'line-through text-gray-400';
          } else if (isAtrasado) {
            className = 'text-red-600 font-semibold';
          }
          
          return <span className={className}>{dateStr}</span>;
        } catch (error) {
          console.error('Erro ao formatar data:', value, error);
          return 'Data Inválida';
        }
      }
    },
    {
      header: 'Categoria',
      accessor: (row) => row?.category || 'N/A'
    },
    {
      header: 'Status',
      accessor: (row) => row?.status || 'PENDENTE',
      cell: (value) => (
        <span className={`px-2 py-1 rounded font-semibold text-xs ${
          value === 'CONCLUIDO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Ações',
      accessor: () => null,
      cell: (_, row) => (
        <div className="flex justify-center items-center space-x-2">
          {row?.status !== 'CONCLUIDO' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(row.id);
              }}
              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300"
              title="Marcar como concluído"
            >
              <FaCheckCircle size="1.1em" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            title="Editar"
          >
            <FaEdit size="1em" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
            title="Excluir Permanentemente"
          >
            <FaTrashAlt size="1em" />
          </button>
        </div>
      ),
      width: '100px',
      textAlign: 'center'
    }
  ], [handleComplete, handleEdit, handleDelete]);

  // Filtra e ordena lembretes
  const lembretesFiltrados = useMemo(() => {
    if (!Array.isArray(lembretes)) return [];
    
    return lembretes
      .filter(lem => {
        // Filtro de status
        if (!filtroStatus) return true;
        return lem.status === filtroStatus;
      })
      .filter(lem => {
        // Filtro de texto
        if (!filtro.trim()) return true;
        const searchTerm = filtro.toLowerCase();
        return (
          lem.description?.toLowerCase().includes(searchTerm) ||
          lem.category?.toLowerCase().includes(searchTerm)
        );
      })
      .sort((a, b) => {
        // Ordenação por data de vencimento
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB;
      });
  }, [lembretes, filtro, filtroStatus]);

  // Loading state
  const isLoading = typeof dataLoading === 'object' ? dataLoading.lembretes : dataLoading;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Meus Lembretes</h1>
        <button
          onClick={openNewLembreteModal}
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
        >
          Adicionar Novo Lembrete
        </button>
      </div>

      {/* Mensagem de erro geral */}
      {error && !isModalOpen && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por descrição ou categoria..."
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="PENDENTE" className="text-gray-700 bg-white">Mostrar Pendentes</option>
          <option value="CONCLUIDO" className="text-gray-700 bg-white">Mostrar Concluídos</option>
          <option value="" className="text-gray-700 bg-white">Mostrar Todos</option>
        </select>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {lembretesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum lembrete encontrado.</p>
            </div>
          ) : (
            <Table data={lembretesFiltrados} columns={columns} />
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentLembrete ? 'Editar Lembrete' : 'Adicionar Lembrete'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && isModalOpen && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Data Vencimento */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Data Vencimento *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={form.dueDate}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Categoria */}
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
              placeholder="Ex: Contas, Pessoal"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Input oculto para movimentoId */}
          <input type="hidden" name="movimentoId" value={form.movimentoId || ''} />

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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