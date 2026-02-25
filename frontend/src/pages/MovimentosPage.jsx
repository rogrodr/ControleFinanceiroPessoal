import React, { useState, useEffect, useMemo, useCallback } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBell, FaEdit, FaTrashAlt } from 'react-icons/fa';

// Recebe a prop onOpenLembreteModal do App.jsx
function MovimentosPage({ onOpenLembreteModal }) {
  const { movimentos, dataLoading, refreshMovimentos, refreshMetas, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovimento, setCurrentMovimento] = useState(null);
  const [filtro, setFiltro] = useState('');

  // === ESTADOS PARA O RELATÓRIO ===
  const [filtroRelatorio, setFiltroRelatorio] = useState({
    dataInicio: '',
    dataFim: '',
    tipo: '' // 'DESPESA', 'RECEITA', ou ''
  });
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [errorRelatorio, setErrorRelatorio] = useState('');

  // Formulário Estado Inicial (envolvido em useCallback for stability)
  const getInitialFormState = useCallback(() => ({
    description: '', valor: '', category: '',
    date: new Date().toISOString().split('T')[0],
    tipo: 'DESPESA', statusPagamento: 'A PAGAR',
    totalParcelas: 1, parcelaAtual: 1,
  }), []);

  const [form, setForm] = useState(getInitialFormState());

  // useEffect para busca inicial (OK)
  useEffect(() => {
    const isLoadingMovimentos = typeof dataLoading === 'object' ? dataLoading.movimentos : dataLoading;
    if (user && Array.isArray(movimentos) && movimentos.length === 0 && !isLoadingMovimentos) {
      console.log("MovimentosPage: Disparando busca inicial (useEffect refinado).");
      refreshMovimentos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ user, movimentos?.length, refreshMovimentos, dataLoading?.movimentos ]);

  // Gera lista de categorias existentes (OK)
  const categoriasExistentes = useMemo(() => {
    if (!Array.isArray(movimentos)) return [];
    const categorias = movimentos
        .map(movimento => movimento.category)
        .filter(cat => cat);
    return [...new Set(categorias)].sort();
  }, [movimentos]);

  // --- HANDLERS (Envolvidos em useCallback) ---
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
      setCurrentMovimento(null);
      setForm(getInitialFormState());
      setError('');
  }, [getInitialFormState]);

  // CORREÇÃO PRINCIPAL: Adiciona refreshMetas após salvar
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!form.description || !form.valor || !form.category || !form.date || !form.tipo || !form.statusPagamento) { 
        setError("Preencha todos os campos obrigatórios (*)."); 
        return; 
      }
      if (parseFloat(form.valor) <= 0) { 
        setError("O valor deve ser positivo."); 
        return; 
      }
      
      const payload = { 
        description: form.description, 
        valor: parseFloat(form.valor), 
        category: form.category, 
        date: form.date, 
        tipo: form.tipo.toUpperCase(), 
        statusPagamento: form.statusPagamento.toUpperCase(), 
        totalParcelas: parseInt(form.totalParcelas, 10) || 1, 
        parcelaAtual: parseInt(form.parcelaAtual, 10) || 1 
      };
      
      if (currentMovimento) { 
        await webbolsoApi.put(`/movimentos/${currentMovimento.id}`, payload); 
      } else { 
        await webbolsoApi.post('/movimentos', payload); 
      }
      
      handleCloseModal(); // Fecha e reseta
      
      // CORREÇÃO: Atualiza ambos - movimentos E metas
      await Promise.all([
        refreshMovimentos(),
        refreshMetas() // << ADICIONADO
      ]);
      
      setFiltro(''); // Limpa filtro
      
    } catch (err) { 
      console.error('Erro ao salvar Movimento:', err.response?.data || err.message); 
      setError(`Erro ao salvar: ${err.response?.data?.message || err.message || 'Verifique os dados.'}`); 
    }
  }, [form, currentMovimento, handleCloseModal, refreshMovimentos, refreshMetas]); // Adiciona refreshMetas

  const handleEdit = useCallback((movimento) => {
    if (!movimento) return;
    setCurrentMovimento(movimento);
    const formattedDate = movimento.date ? new Date(movimento.date).toISOString().split('T')[0] : '';
    setForm({ 
      description: movimento.description || '', 
      valor: movimento.valor || '', 
      category: movimento.category || '', 
      date: formattedDate, 
      tipo: movimento.tipo || 'DESPESA', 
      statusPagamento: movimento.statusPagamento || 'A PAGAR', 
      totalParcelas: movimento.totalParcelas || 1, 
      parcelaAtual: movimento.parcelaAtual || 1 
    });
    setError('');
    setIsModalOpen(true);
  }, []);

  // CORREÇÃO: Adiciona refreshMetas após deletar
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este movimento?')) {
      setError('');
      try { 
        await webbolsoApi.delete(`/movimentos/${id}`); 
        
        // CORREÇÃO: Atualiza ambos
        await Promise.all([
          refreshMovimentos(),
          refreshMetas() // << ADICIONADO
        ]);
        
      } catch (err) { 
        console.error('Erro ao excluir Movimento:', err); 
        setError('Erro ao excluir movimento.'); 
      }
    }
  }, [refreshMovimentos, refreshMetas]); // Adiciona refreshMetas

  const openNewMovimentoModal = useCallback(() => {
    setCurrentMovimento(null);
    setForm(getInitialFormState());
    setError('');
    setIsModalOpen(true);
  }, [getInitialFormState]);

  const handleCreateReminderFromMovimento = useCallback((movimento) => {
      if (!onOpenLembreteModal) {
          console.error("MovimentosPage: Função onOpenLembreteModal não foi passada via props!");
          alert("Erro: Configuração incompleta.");
          return;
      }
      const formattedDate = movimento.date ? new Date(movimento.date).toISOString().split('T')[0] : '';
      const lembreteData = {
          description: `Lembrete: ${movimento.description}`,
          dueDate: formattedDate,
          category: movimento.category || 'Pagamento',
          movimentoId: movimento.id
      };
      console.log("MovimentosPage: Chamando onOpenLembreteModal com:", JSON.stringify(lembreteData));
      onOpenLembreteModal(lembreteData);
  }, [onOpenLembreteModal]);

  // --- HANDLERS DO RELATÓRIO ---

  const handleFiltroRelatorioChange = useCallback((e) => {
    const { name, value } = e.target;
    setFiltroRelatorio(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleGerarRelatorio = useCallback(async (preview = false) => {
    setLoadingRelatorio(true);
    setErrorRelatorio('');

    try {
      // 1. Construir os parâmetros da URL
      const params = new URLSearchParams();
      if (filtroRelatorio.dataInicio) {
        params.append('dataInicio', filtroRelatorio.dataInicio);
      }
      if (filtroRelatorio.dataFim) {
        params.append('dataFim', filtroRelatorio.dataFim);
      }
      if (filtroRelatorio.tipo) {
        params.append('tipo', filtroRelatorio.tipo);
      }

      // 2. Escolher o endpoint (preview ou download)
      const endpoint = preview
        ? `/relatorios/movimentos/pdf/preview?${params.toString()}`
        : `/relatorios/movimentos/pdf?${params.toString()}`;

      // 3. Fazer a chamada com 'webbolsoApi'
      const response = await webbolsoApi.get(endpoint, {
        responseType: 'blob', // !!! IMPORTANTE !!!
      });

      // 4. Lidar com o 'blob' (o arquivo PDF)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(blob);

      if (preview) {
        // 5a. Para 'preview', abrir em uma nova aba
        window.open(fileURL, '_blank');
      } else {
        // 5b. Para 'download', criar um link <a> e clicar nele
        
        // Tenta pegar o nome do arquivo do header (definido no backend)
        let fileName = 'movimentos.pdf';
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (fileNameMatch && fileNameMatch.length > 1) {
            fileName = fileNameMatch[1];
          }
        }

        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', fileName); // Usa o nome do backend
        document.body.appendChild(link);
        link.click();
        
        // Limpeza
        document.body.removeChild(link);
        window.URL.revokeObjectURL(fileURL);
      }

    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      let errorMsg = 'Erro desconhecido ao gerar relatório.';

      // Tenta ler a mensagem de erro que o backend enviou (que pode ser um blob)
      if (err.response && err.response.data) {
        if (err.response.data instanceof Blob) {
          try {
            // O backend pode ter retornado o erro como um texto/json dentro do blob
            const errorText = await err.response.data.text();
            try {
              // Tenta parsear como JSON
              const errorJson = JSON.parse(errorText);
              errorMsg = errorJson.message || errorText;
            } catch (e) {
              errorMsg = errorText; // Não era JSON, usa o texto puro
            }
          } catch (e) {
            errorMsg = 'Não foi possível ler a mensagem de erro do servidor.';
          }
        } else if (err.response.data.message) {
          // Erro JSON padrão
          errorMsg = err.response.data.message;
        } else {
          errorMsg = err.message;
        }
      }
      setErrorRelatorio(`Erro: ${errorMsg}`);
    } finally {
      setLoadingRelatorio(false);
    }
  }, [filtroRelatorio]); // Depende de 'filtroRelatorio'

  // --- Definição das Colunas ---
  const columns = useMemo(() => [
    { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
    { header: 'Valor', accessor: (row) => `R$ ${(row?.valor ?? 0).toFixed(2)}`, cellClassName: 'text-right' },
    { header: 'Tipo', accessor: (row) => row?.tipo || 'N/A',
      cell: (value) => ( 
        <span className={`px-2 py-1 rounded font-semibold text-xs ${ 
          value === 'DESPESA' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' 
        }`}> 
          {value} 
        </span> 
      )
    },
    { header: 'Status', accessor: (row) => row?.statusPagamento || 'N/A',
      cell: (value) => ( 
        <span className={`px-2 py-1 rounded font-semibold text-xs ${ 
          value === 'PAGO' || value === 'RECEBIDO' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800' 
        }`}> 
          {value} 
        </span> 
      )
    },
    { header: 'Categoria', accessor: (row) => row?.category || 'N/A' },
    { header: 'Data', accessor: (row) => row?.date ? new Date(row.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A' },
    {
      header: 'Ações',
      accessor: () => null,
      cell: (_, row) => (
        <div className="flex justify-center items-center space-x-2">
          {(row.statusPagamento === 'A PAGAR' || row.statusPagamento === 'A RECEBER') ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleCreateReminderFromMovimento(row); }} 
              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300" 
              title="Criar lembrete"
            >
              <FaBell size="1em"/>
            </button>
          ) : (
            <div className="p-1 invisible" aria-hidden="true"><FaBell size="1em"/></div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }} 
            className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300" 
            title="Editar"
          >
            <FaEdit size="1em"/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} 
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300" 
            title="Excluir"
          >
            <FaTrashAlt size="1em"/>
          </button>
        </div>
      ),
      width: '100px',
      textAlign: 'center'
    }
  ], [handleCreateReminderFromMovimento, handleEdit, handleDelete]);

  // Filtra movimentos
  const movimentosFiltrados = useMemo(() => {
    if (!Array.isArray(movimentos)) return [];
    return movimentos.filter(movimento => {
        const termoBusca = filtro.toLowerCase();
        const descMatch = movimento.description && movimento.description.toLowerCase().includes(termoBusca);
        const catMatch = movimento.category && movimento.category.toLowerCase().includes(termoBusca);
        return descMatch || catMatch;
    });
  }, [movimentos, filtro]);

  // Loading state
  const isLoading = typeof dataLoading === 'object' ? dataLoading.movimentos : dataLoading;

  // --- JSX COMPLETO ---
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md h-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Minhas Movimentações</h1>
          <button
              onClick={openNewMovimentoModal}
              className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
              Adicionar Nova Movimentação
          </button>
      </div>

      {/* Input de Busca */}
      <div className="mb-4">
          <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
          />
      </div>

      {/* Tabela */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error && !isModalOpen ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Table
          data={movimentosFiltrados}
          columns={columns}
        />
      )}

      {/* === SEÇÃO RELATÓRIO MOVIDA PARA CÁ === */}
      <div className="my-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Gerar Relatório de Movimentos</h2>
        {errorRelatorio && <p className="text-red-500 text-sm mb-3 text-center">{errorRelatorio}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Input Data Início */}
          <div>
            <label htmlFor="relatorioDataInicio" className="block text-sm font-medium text-gray-700">Data Início</label>
            <input 
              type="date" 
              id="relatorioDataInicio" 
              name="dataInicio"
              value={filtroRelatorio.dataInicio} 
              onChange={handleFiltroRelatorioChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Input Data Fim */}
          <div>
            <label htmlFor="relatorioDataFim" className="block text-sm font-medium text-gray-700">Data Fim</label>
            <input 
              type="date" 
              id="relatorioDataFim" 
              name="dataFim"
              value={filtroRelatorio.dataFim} 
              onChange={handleFiltroRelatorioChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Select Tipo */}
          <div>
            <label htmlFor="relatorioTipo" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select 
              id="relatorioTipo" 
              name="tipo"
              value={filtroRelatorio.tipo} 
              onChange={handleFiltroRelatorioChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>
          
          {/* Botões */}
          <div className="flex items-end space-x-2">
            <button
              onClick={() => handleGerarRelatorio(false)} // false = download
              disabled={loadingRelatorio}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRelatorio ? 'Gerando...' : 'Baixar PDF'}
            </button>
            <button
              onClick={() => handleGerarRelatorio(true)} // true = preview
              disabled={loadingRelatorio}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRelatorio ? '...' : 'Visualizar'}
            </button>
          </div>
        </div>
      </div>
      {/* === FIM DA SEÇÃO DE RELATÓRIO === */}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentMovimento ? 'Editar Movimentação' : 'Adicionar Movimentação'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            {error && isModalOpen && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {/* Tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo *</label>
              <select 
                id="tipo" 
                name="tipo" 
                value={form.tipo} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="DESPESA">DESPESA</option> 
                <option value="RECEITA">RECEITA</option>
              </select>
            </div>
            {/* Status */}
            <div>
              <label htmlFor="statusPagamento" className="block text-sm font-medium text-gray-700">Status *</label>
              <select 
                id="statusPagamento" 
                name="statusPagamento" 
                value={form.statusPagamento} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="A PAGAR">A Pagar</option> 
                <option value="PAGO">Pago</option> 
                <option value="A RECEBER">A Receber</option> 
                <option value="RECEBIDO">Recebido</option>
              </select>
            </div>
            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
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
            {/* Valor */}
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor *</label>
              <input 
                type="number" 
                id="valor" 
                name="valor" 
                value={form.valor} 
                onChange={handleInputChange} 
                step="0.01" 
                required 
                min="0.01" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* Categoria com Datalist */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria *</label>
              <input 
                list="categorias-movimento-list" 
                id="category" 
                name="category" 
                value={form.category} 
                onChange={handleInputChange} 
                required 
                placeholder="Digite ou selecione" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <datalist id="categorias-movimento-list">
                {categoriasExistentes.map(cat => ( <option key={cat} value={cat} /> ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">Comece a digitar para ver sugestões ou crie uma nova.</p>
            </div>
            {/* Data */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data *</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                value={form.date} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* Parcelas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalParcelas" className="block text-sm font-medium text-gray-700">Total Parcelas *</label>
                <input 
                  type="number" 
                  id="totalParcelas" 
                  name="totalParcelas" 
                  value={form.totalParcelas} 
                  onChange={handleInputChange} 
                  step="1" 
                  min="1" 
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="parcelaAtual" className="block text-sm font-medium text-gray-700">Parcela Atual *</label>
                <input 
                  type="number" 
                  id="parcelaAtual" 
                  name="parcelaAtual" 
                  value={form.parcelaAtual} 
                  onChange={handleInputChange} 
                  step="1" 
                  min="1" 
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
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

export default MovimentosPage;