import React, { useState } from 'react';
import webbolsoApi from '../api/webbolsoApi';
import LoadingSpinner from '../components/LoadingSpinner';

function SimuladorPage() {
  // 1. Nomes dos campos do formulário atualizados
  const [form, setForm] = useState({
    valorDesejado: '',
    taxaJurosMensal: '', // Corrigido
    prazoMeses: '',      // Corrigido
  });
  
  const [simulacao, setSimulacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSimulacao(null);

    try {
      // 2. Payload corrigido para bater com o SimulacaoRequestDTO
      const payload = {
        valorDesejado: parseFloat(form.valorDesejado),
        // O backend espera a taxa em decimal (ex: 1.5% -> 0.015)
        taxaJurosMensal: parseFloat(form.taxaJurosMensal) / 100, 
        prazoMeses: parseInt(form.prazoMeses, 10),
      };

      const response = await webbolsoApi.post('/simulador/emprestimo-price', payload);
      setSimulacao(response.data); 
    } catch (err) {
      console.error('Erro ao simular:', err.response?.data || err.message);
      setError('Erro ao realizar a simulação. Verifique os valores.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
        Simulador de Empréstimo (Tabela Price)
      </h1>
      
      {/* 3. Nomes dos campos 'name' e 'id' atualizados */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="valorDesejado" className="block text-sm font-medium text-gray-700">
            Valor Desejado (R$)
          </label>
          <input
            type="number"
            id="valorDesejado"
            name="valorDesejado"
            value={form.valorDesejado}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="taxaJurosMensal" className="block text-sm font-medium text-gray-700">
            Taxa de Juros Mensal (%)
          </label>
          <input
            type="number"
            id="taxaJurosMensal"
            name="taxaJurosMensal"
            value={form.taxaJurosMensal}
            onChange={handleInputChange}
            step="0.01"
            required
            placeholder="Ex: 1.5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="prazoMeses" className="block text-sm font-medium text-gray-700">
            Prazo (em meses)
          </label>
          <input
            type="number"
            id="prazoMeses"
            name="prazoMeses"
            value={form.prazoMeses}
            onChange={handleInputChange}
            step="1"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="md:mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Simular'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Tabela de Resultados */}
      {/* 4. Nomes dos campos de resposta atualizados */}
      {simulacao && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Resultado da Simulação
          </h2>
          <div className="flex justify-around mb-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="block text-sm text-gray-600">Valor da Parcela (Fixa)</span>
              <span className="text-xl font-bold text-blue-700">R$ {simulacao.valorParcelaFixa?.toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Total Pago</span>
              {/* O total pago é o valor financiado + total de juros */}
              <span className="text-xl font-bold text-gray-800">R$ {(simulacao.valorTotalFinanciado + simulacao.valorTotalJuros).toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-600">Total de Juros</span>
              <span className="text-xl font-bold text-red-600">R$ {simulacao.valorTotalJuros?.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Parcela</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Parcela</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amortização</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Juros</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Devedor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Corrigido de 'simulacao.detalhes' para 'simulacao.tabelaAmortizacao' */}
                {simulacao.tabelaAmortizacao?.map((p) => (
                  <tr key={p.numeroParcela}>
                    <td className="px-6 py-4">{p.numeroParcela}</td>
                    <td className="px-6 py-4 font-medium">R$ {p.valorParcela?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-green-600">R$ {p.valorAmortizacao?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-red-600">R$ {p.valorJuros?.toFixed(2)}</td>
                    <td className="px-6 py-4">R$ {p.saldoDevedorFinal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimuladorPage;