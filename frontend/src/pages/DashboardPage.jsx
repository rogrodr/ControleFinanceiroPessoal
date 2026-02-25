import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import webbolsoApi from '../api/webbolsoApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Mapeamento de meses
const monthNames = {
  "JANUARY": 'Jan', "FEBRUARY": 'Fev', "MARCH": 'Mar', "APRIL": 'Abr', 
  "MAY": 'Mai', "JUNE": 'Jun', "JULY": 'Jul', "AUGUST": 'Ago', 
  "SEPTEMBER": 'Set', "OCTOBER": 'Out', "NOVEMBER": 'Nov', "DECEMBER": 'Dez'
};

// O ano agora é uma constante, definida fora do componente
// Isso remove o "erro" do linter (variável não usada)
const CURRENT_YEAR = new Date().getFullYear();

// Componente da Barra de Progresso (Helper)
const MetaProgressBar = ({ meta }) => {
  const { description, currentAmount, targetAmount } = meta;
  const percentage = (targetAmount > 0) 
    ? Math.min((currentAmount / targetAmount) * 100, 100) 
    : 0;

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-gray-700">{description}</span>
        <span className="text-sm font-medium text-gray-700">
          R$ {currentAmount.toFixed(2)} / R$ {targetAmount.toFixed(2)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden border border-gray-300">
        <div
          className="bg-blue-600 h-5 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none"
          style={{ width: `${percentage}%` }}
        >
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
};


function DashboardPage() {
  const { metas, dataLoading: metasLoading } = useAuth();
  
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [totalSaldoDevedor, setTotalSaldoDevedor] = useState(0);
  const [despesasPorCategoria, setDespesasPorCategoria] = useState({});
  const [resumoMensalDespesas, setResumoMensalDespesas] = useState({});
  const [resumoMensalReceitas, setResumoMensalReceitas] = useState({});
  
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setAnalyticsLoading(true);
    setError('');
    try {
      const [
        totalDespesasRes,
        totalReceitasRes,
        saldoDevedorRes,
        categoriaDespesasRes,
        mensalDespesasRes,
        mensalReceitasRes,
      ] = await Promise.all([
        webbolsoApi.get('/movimentos/total?tipo=DESPESA'),
        webbolsoApi.get('/movimentos/total?tipo=RECEITA'),
        webbolsoApi.get('/emprestimos/saldo-devedor-total'),
        webbolsoApi.get('/movimentos/por-categoria?tipo=DESPESA'),
        webbolsoApi.get(`/movimentos/resumo-mensal?year=${CURRENT_YEAR}&tipo=DESPESA`), 
        webbolsoApi.get(`/movimentos/resumo-mensal?year=${CURRENT_YEAR}&tipo=RECEITA`),
      ]);

      const despesas = totalDespesasRes.data || 0;
      const receitas = totalReceitasRes.data || 0;

      setTotalDespesas(despesas);
      setTotalReceitas(receitas);
      setSaldo(receitas - despesas);
      setTotalSaldoDevedor(saldoDevedorRes.data?.totalSaldoDevedor || 0);
      setDespesasPorCategoria(categoriaDespesasRes.data || {});
      setResumoMensalDespesas(mensalDespesasRes.data || {});
      setResumoMensalReceitas(mensalReceitasRes.data || {});
      
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard.');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Lógica dos Gráficos (sem alteração) ---
  const categoryChartData = {
    labels: Object.keys(despesasPorCategoria),
    datasets: [
      {
        data: Object.values(despesasPorCategoria),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const allMonthKeys = new Set([
      ...Object.keys(resumoMensalDespesas), 
      ...Object.keys(resumoMensalReceitas)
  ]);
  
  const monthKeyToNumber = (key) => {
    const monthIndex = Object.keys(monthNames).indexOf(key);
    return monthIndex !== -1 ? monthIndex + 1 : 0;
  };

  const sortedMonthKeys = Array.from(allMonthKeys).sort((a, b) => monthKeyToNumber(a) - monthKeyToNumber(b));
  
  const monthlyLabels = sortedMonthKeys.map(monthKey => monthNames[monthKey] || monthKey);
  
  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Total de Receitas',
        data: sortedMonthKeys.map(monthKey => resumoMensalReceitas[monthKey] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total de Despesas',
        data: sortedMonthKeys.map(monthKey => resumoMensalDespesas[monthKey] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gráfico',
      },
    },
  };
  // --- Fim da Lógica dos Gráficos ---

  if (analyticsLoading || metasLoading) return <LoadingSpinner />;
  
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="movimentoiner mx-auto p-4 space-y-8">
      {/* O TÍTULO FOI REMOVIDO DESTA LINHA */}

      {/* CARDS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Saldo Atual</h2>
          <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border border-green-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Receitas</h2>
          <p className="text-4xl font-bold text-green-600">
            R$ {totalReceitas.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border border-red-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Despesas</h2>
          <p className="text-4xl font-bold text-red-600">
            R$ {totalDespesas.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Saldo Devedor</h2>
          <p className="text-4xl font-bold text-gray-800">
            R$ {totalSaldoDevedor.toFixed(2)}
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Receitas vs Despesas ({CURRENT_YEAR})</h2>
          
          {monthlyLabels.length > 0 ? (
            <div className="h-72 w-full">
              <Bar data={monthlyChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Resumo Mensal' } } }} />
            </div>
          ) : (
            <p className="text-gray-600">Nenhum dado de resumo mensal.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-purple-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Despesas por Categoria</h2>
          {Object.keys(despesasPorCategoria).length > 0 ? (
            <div className="h-72 w-full flex justify-center">
              <div className="max-w-[300px]">
                <Doughnut data={categoryChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Despesas por Categoria' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Nenhum dado de despesa por categoria.</p>
          )}
        </div>
      </div>

      {/* SEÇÃO DE METAS */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Acompanhamento de Metas</h2>
        {metas && metas.length > 0 ? (
          metas.map(meta => (
            <MetaProgressBar key={meta.id} meta={meta} />
          ))
        ) : (
          <p className="text-gray-600 text-center">Nenhuma meta cadastrada.</p>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;