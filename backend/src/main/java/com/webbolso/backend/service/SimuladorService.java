package com.webbolso.backend.service;

import com.webbolso.backend.dto.SimulacaoRequestDTO;
import com.webbolso.backend.dto.SimulacaoResponseDTO;
import com.webbolso.backend.dto.DetalheParcelaDTO;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class SimuladorService {

    public SimulacaoResponseDTO simularEmprestimoPrice(SimulacaoRequestDTO request) {
        double valor = request.getValorDesejado();
        int prazo = request.getPrazoMeses();
        double taxa = request.getTaxaJurosMensal();

        // Cálculo da Parcela Fixa (Tabela Price)
        double valorParcela = calcularParcelaPrice(valor, taxa, prazo);

        List<DetalheParcelaDTO> tabela = new ArrayList<>();
        double saldoDevedor = valor;
        double totalJuros = 0;

        for (int i = 1; i <= prazo; i++) {
            double saldoInicial = saldoDevedor;
            double juros = saldoDevedor * taxa;
            double amortizacao = valorParcela - juros;
            
            // Corrige a última parcela
            if (i == prazo) {
                // Ajuste para garantir que o saldo final seja zero
                amortizacao = saldoDevedor;
                valorParcela = juros + amortizacao; // Recalcula o valor da última parcela se houver pequenos erros de arredondamento
            }
            
            saldoDevedor -= amortizacao;
            if (saldoDevedor < 0) saldoDevedor = 0; // Evita valores negativos por erro de ponto flutuante

            totalJuros += juros;

            DetalheParcelaDTO detalhe = new DetalheParcelaDTO();
            detalhe.setNumeroParcela(i);
            detalhe.setSaldoDevedorInicial(saldoInicial);
            detalhe.setValorJuros(juros);
            detalhe.setValorAmortizacao(amortizacao);
            detalhe.setValorParcela(valorParcela);
            detalhe.setSaldoDevedorFinal(saldoDevedor);
            tabela.add(detalhe);
        }

        SimulacaoResponseDTO response = new SimulacaoResponseDTO();
        response.setValorTotalFinanciado(valor);
        response.setValorTotalJuros(totalJuros);
        response.setValorParcelaFixa(calcularParcelaPrice(valor, taxa, prazo)); // Retorna o valor fixo da maioria das parcelas
        response.setTabelaAmortizacao(tabela);

        return response;
    }

    private double calcularParcelaPrice(double principal, double taxa, int n) {
        if (taxa == 0) return principal / n;
        // Fórmula da Parcela Price (PMT)
        return principal * (taxa / (1 - Math.pow(1 + taxa, -n)));
    }
}