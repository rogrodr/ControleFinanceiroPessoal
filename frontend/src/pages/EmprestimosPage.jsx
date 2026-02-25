// pages/EmprestimosPage.js
import React, { useState, useEffect, useMemo } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
// --- IMPORTAR ÍCONES ---
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
// --- FIM IMPORT ---

function EmprestimosPage() {
  // Pega dados e funções de refresh do context
  const { emprestimos, dataLoading, refreshEmprestimos, refreshMovimentos, user } = useAuth();
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmprestimo, setCurrentEmprestimo] = useState(null);
  const [filtro, setFiltro] = useState(''); // Estado para filtro

  // Estado inicial do formulário completo
  const getInitialFormState = () => ({
    description: '', valorTotal: '', dataContratacao: new Date().toISOString().split('T')[0],
    totalParcelas: '', categoria: '', valorParcela: '',
    dataPrimeiraParcela: '', taxaJurosMensal: '',
  });

  const [form, setForm] = useState(getInitialFormState());

  // Efeito para buscar dados iniciais (com deps estáveis)
  useEffect(() => {
     const isLoadingEmprestimos = typeof dataLoading === 'object' ? dataLoading.emprestimos : dataLoading;
     if (user && Array.isArray(emprestimos) && emprestimos.length === 0 && !isLoadingEmprestimos) {
       console.log("EmprestimosPage: Disparando busca inicial.");
       refreshEmprestimos();
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ user, emprestimos?.length, refreshEmprestimos, dataLoading?.emprestimos ]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
     const { name, value } = e.target;
     setForm({ ...form, [name]: value });
  };

  const handleSave = async (e) => {
     e.preventDefault();
     setError('');
     try {
       // Validações...
       if (!form.description || !form.valorTotal || !form.totalParcelas || !form.valorParcela || !form.dataPrimeiraParcela || !form.taxaJurosMensal || !form.categoria || !form.dataContratacao) { setError('Preencha todos os campos obrigatórios (*).'); return; }
       if (parseFloat(form.taxaJurosMensal) < 0) { setError('A taxa de juros não pode ser negativa.'); return; }
       if (parseFloat(form.valorTotal) <= 0) { setError('O valor total deve ser positivo.'); return; }
       if (parseInt(form.totalParcelas, 10) < 1) { setError('O número de parcelas deve ser ao menos 1.'); return; }
       if (parseFloat(form.valorParcela) <= 0) { setError('O valor da parcela deve ser positivo.'); return; }
       if (!form.dataContratacao || !form.dataPrimeiraParcela) { setError('Datas inválidas.'); return; }

       const payload = { description: form.description, valorTotal: parseFloat(form.valorTotal), dataContratacao: form.dataContratacao, totalParcelas: parseInt(form.totalParcelas, 10), categoria: form.categoria, valorParcela: parseFloat(form.valorParcela), dataPrimeiraParcela: form.dataPrimeiraParcela, taxaJurosMensal: parseFloat(form.taxaJurosMensal) };

       if (currentEmprestimo) {
         await webbolsoApi.put(`/emprestimos/${currentEmprestimo.id}`, payload);
         alert("Parcelamento atualizado (apenas campos descritivos).");
       } else {
         await webbolsoApi.post('/emprestimos', payload);
       }

       setIsModalOpen(false); setForm(getInitialFormState()); setCurrentEmprestimo(null);
       refreshEmprestimos();
       if (refreshMovimentos) { console.log("Chamando refreshMovimentos..."); refreshMovimentos(); }
       else { console.warn("refreshMovimentos não encontrado."); }

     } catch (err) { console.error('Erro ao salvar:', err.response?.data || err.message); setError(`Erro: ${err.response?.data?.message || err.message || 'Verifique os dados.'}`); }
  };

  const handleEdit = (emprestimo) => { // Handler original
     if(!emprestimo) return;
     setCurrentEmprestimo(emprestimo);
     const taxaPercentual = emprestimo.taxaJurosMensal ? (emprestimo.taxaJurosMensal * 100).toFixed(2) : '';
     setForm({ description: emprestimo.description || '', valorTotal: emprestimo.valorTotal || '', dataContratacao: emprestimo.dataContratacao ? new Date(emprestimo.dataContratacao).toISOString().split('T')[0] : '', totalParcelas: emprestimo.totalParcelas || '', categoria: emprestimo.categoria || '', taxaJurosMensal: taxaPercentual, valorParcela: '' , dataPrimeiraParcela: '' });
     setError(''); setIsModalOpen(true);
  };

  const handleDelete = async (id) => { // Handler original
      if (window.confirm('Tem certeza? Isso excluirá o registro do parcelamento mas manterá o histórico de parcelas nos movimentos.')) {
        setError('');
        try { await webbolsoApi.delete(`/emprestimos/${id}`); refreshEmprestimos(); }
        catch (err) { console.error('Erro ao excluir:', err); setError('Erro ao excluir.'); }
      }
  };

  const openNewEmprestimoModal = () => { // Handler original
     setCurrentEmprestimo(null); setForm(getInitialFormState()); setError(''); setIsModalOpen(true);
  };
  // --- FIM HANDLERS ---


  // --- **CORREÇÃO APLICADA AQUI** ---
  // Definição das Colunas com 'Ações' unificada (sem sino)
  const columns = useMemo(() => [
     { header: 'Descrição', accessor: (row) => row?.description || 'N/A' },
     { header: 'Saldo Devedor', accessor: (row) => `R$ ${(row?.saldoDevedor ?? 0).toFixed(2)}`, cellClassName: 'text-right' },
     { header: 'Valor Total', accessor: (row) => `R$ ${(row?.valorTotal ?? 0).toFixed(2)}`, cellClassName: 'text-right' },
     { header: 'Parcelas Pagas', accessor: (row) => `${row?.parcelasPagas ?? 0} / ${row?.totalParcelas ?? '?'}` },
     { header: 'Taxa Juros', accessor: (row) => row?.taxaJurosMensal ? `${(row.taxaJurosMensal * 100).toFixed(2)}% a.m.` : 'N/A' },
     { header: 'Categoria', accessor: (row) => row?.categoria || 'N/A' },
     { header: 'Status', accessor: (row) => row?.status || 'N/A',
       cell: (value) => ( <span className={`px-2 py-1 rounded font-semibold text-xs ${ value === 'QUITADO' ? 'bg-green-100 text-green-800' : value === 'ATIVO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800' }`}> {value} </span> )
     },
     // --- Coluna 'Ações' Unificada (Apenas Editar/Excluir) ---
     {
       header: 'Ações',
       accessor: () => null,
       cell: (_, row) => (
         <div className="flex justify-center items-center space-x-2">
           {/* Botão Editar */}
           <button
             onClick={(e) => { e.stopPropagation(); handleEdit(row); }} // Chama handleEdit
             className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
             title="Editar (limitado)" aria-label="Editar parcelamento"
             disabled={true} // Mantido desabilitado por enquanto
           >
             <FaEdit size="1em"/>
           </button>
           {/* Botão Excluir */}
           <button
             onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} // Chama handleDelete
             className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
             title="Excluir" aria-label="Excluir parcelamento"
           >
             <FaTrashAlt size="1em"/>
           </button>
         </div>
       ),
        width: '80px', // Largura para 2 botões
        textAlign: 'center'
     }
     // --- FIM DA Coluna 'Ações' ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []); // Dependências vazias (assumindo handlers estáveis)
  // --- FIM DA CORREÇÃO ---


  // Filtra empréstimos
  const emprestimosFiltrados = useMemo(() => {
     if (!Array.isArray(emprestimos)) return [];
     return emprestimos.filter(emp => {
         const termoBusca = filtro.toLowerCase();
         const descMatch = emp.description && emp.description.toLowerCase().includes(termoBusca);
         const catMatch = emp.categoria && emp.categoria.toLowerCase().includes(termoBusca);
         return descMatch || catMatch;
     });
  }, [emprestimos, filtro]);

  // Loading state
  const isLoading = typeof dataLoading === 'object' ? dataLoading.emprestimos : dataLoading;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md h-full">
       {/* Cabeçalho */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Emprestimos e Financiamentos</h1>
        <button
          onClick={openNewEmprestimoModal} // Chama handler original
          className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
        >
          Adicionar Novo
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
        // --- **CORREÇÃO APLICADA AQUI** ---
        // Remover props onEdit/onDelete do Table
        <Table
          data={emprestimosFiltrados} // Usa dados filtrados
          columns={columns} // Passa as colunas com a 'Ações' unificada
          // onEdit={handleEdit} // REMOVIDO
          // onDelete={handleDelete} // REMOVIDO
        />
        // --- FIM DA CORREÇÃO ---
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEmprestimo ? 'Editar Parcelamento' : 'Adicionar Parcelamento'}
      >
        {/* FORMULÁRIO COMPLETO E ESTILIZADO */}
        <form onSubmit={handleSave} className="space-y-4"> {/* Chama handler original */}
            {error && isModalOpen && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
              <input type="text" id="description" name="description" value={form.description} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ..."/>
            </div>
            {/* Valor Total / Data Contrat. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700">Valor Total (R$) *</label><input type="number" id="valorTotal" name="valorTotal" value={form.valorTotal} onChange={handleInputChange} step="0.01" required min="0.01" className="mt-1 block w-full ..."/></div>
              <div><label htmlFor="dataContratacao" className="block text-sm font-medium text-gray-700">Data Contratação *</label><input type="date" id="dataContratacao" name="dataContratacao" value={form.dataContratacao} onChange={handleInputChange} required className="mt-1 block w-full ..."/></div>
            </div>
            {/* Total Parcelas / Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div><label htmlFor="totalParcelas" className="block text-sm font-medium text-gray-700">Total Parcelas *</label><input type="number" id="totalParcelas" name="totalParcelas" value={form.totalParcelas} onChange={handleInputChange} step="1" required min="1" className="mt-1 block w-full ..."/></div>
               <div><label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria *</label><input type="text" id="categoria" name="categoria" value={form.categoria} onChange={handleInputChange} required placeholder="Ex: Veículo, Pessoal" className="mt-1 block w-full ..."/></div>
            </div>
            {/* Valor Parcela / Data 1a Parcela */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div><label htmlFor="valorParcela" className="block text-sm font-medium text-gray-700">Valor da Parcela (R$) *</label><input type="number" id="valorParcela" name="valorParcela" value={form.valorParcela} onChange={handleInputChange} step="0.01" required min="0.01" className="mt-1 block w-full ..."/><p className="mt-1 text-xs text-gray-500">Valor fixo mensal.</p></div>
                 <div><label htmlFor="dataPrimeiraParcela" className="block text-sm font-medium text-gray-700">Data 1ª Parcela *</label><input type="date" id="dataPrimeiraParcela" name="dataPrimeiraParcela" value={form.dataPrimeiraParcela} onChange={handleInputChange} required className="mt-1 block w-full ..."/></div>
             </div>
            {/* Taxa de Juros */}
            <div>
                 <label htmlFor="taxaJurosMensal" className="block text-sm font-medium text-gray-700">Taxa Juros Mensal (%) *</label><input type="number" id="taxaJurosMensal" name="taxaJurosMensal" value={form.taxaJurosMensal} onChange={handleInputChange} step="0.01" required min="0" placeholder="Ex: 1.5" className="mt-1 block w-full ..."/><p className="mt-1 text-xs text-gray-500">Informe a taxa como porcentagem.</p>
            </div>
            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md ..."> Cancelar </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md ... disabled:opacity-50" disabled={!!currentEmprestimo} title={currentEmprestimo ? "Edição limitada" : "Salvar"}> {currentEmprestimo ? 'Salvar (Limitado)' : 'Salvar'} </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmprestimosPage;