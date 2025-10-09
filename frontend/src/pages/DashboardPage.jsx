import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import webbolsoApi from '../api/webbolsoApi';
import LoadingSpinner from '../components/LoadingSpinner';

// Registra os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DashboardPage() {
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [despesasPorCategoria, setDespesasPorCategoria] = useState({});
  const [resumoMensal, setResumoMensal] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        totalRes,
        categoriaRes,
        mensalRes,
      ] = await Promise.all([
        webbolsoApi.get('/despesas/total'),
        webbolsoApi.get('/despesas/por-categoria'),
        webbolsoApi.get('/despesas/resumo-mensal?year=2024'), // Exemplo: buscar dados de 2024
      ]);

      setTotalDespesas(totalRes.data || 0);
      setDespesasPorCategoria(categoriaRes.data || {});
      setResumoMensal(mensalRes.data || {});
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dados para o gráfico de despesas por categoria (Doughnut/Pizza)
  const categoryChartData = {
    labels: Object.keys(despesasPorCategoria),
    datasets: [
      {
        data: Object.values(despesasPorCategoria),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mapeamento de números de mês para nomes (Chart.js retorna 1 para Janeiro, etc.)
  const monthNames = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
    5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
    9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
  };

  // Ordenar os meses para o gráfico de barras
  const sortedMonths = Object.keys(resumoMensal).sort((a, b) => parseInt(a) - parseInt(b));
  const monthlyLabels = sortedMonths.map(monthNum => monthNames[monthNum]);
  const monthlyDataValues = sortedMonths.map(monthNum => resumoMensal[monthNum]);


  // Dados para o gráfico de resumo mensal (Barra)
  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Total de Despesas por Mês',
        data: monthlyDataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permite que o chart se ajuste ao contêiner
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Gráfico',
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#333',
      },
    },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Dashboard Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Total de Despesas */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total de Despesas</h2>
          <p className="text-4xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
        </div>

        {/* Gráfico de Despesas por Categoria */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1 border border-purple-200 flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Despesas por Categoria</h2>
          {Object.keys(despesasPorCategoria).length > 0 ? (
            <div className="h-64 w-64 md:h-72 md:w-72">
              <Doughnut data={categoryChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Despesas por Categoria' } } }} />
            </div>
          ) : (
            <p className="text-gray-600">Nenhum dado de despesa por categoria.</p>
          )}
        </div>

        {/* Gráfico de Resumo Mensal */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1 border border-green-200 flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumo Mensal de Despesas (2024)</h2>
          {Object.keys(resumoMensal).length > 0 ? (
            <div className="h-64 w-full">
              <Bar data={monthlyChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Resumo Mensal de Despesas' } } }} />
            </div>
          ) : (
            <p className="text-gray-600">Nenhum dado de resumo mensal.</p>
          )}
        </div>
      </div>
      {/* Mais gráficos aqui para Orçamentos, Metas, Lembretes se o backend suportar endpoints de resumo */}
    </div>
  );
}

export default DashboardPage;