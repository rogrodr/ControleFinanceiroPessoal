package com.webbolso.backend.dto;

import java.util.List;

public class SimulacaoResponseDTO {
    private double valorTotalFinanciado;
    private double valorTotalJuros;
    private double valorParcelaFixa;
    private List<DetalheParcelaDTO> tabelaAmortizacao;

    public double getValorTotalFinanciado() {
        return valorTotalFinanciado;
    }

    public void setValorTotalFinanciado(double valorTotalFinanciado) {
        this.valorTotalFinanciado = valorTotalFinanciado;
    }

    public double getValorTotalJuros() {
        return valorTotalJuros;
    }

    public void setValorTotalJuros(double valorTotalJuros) {
        this.valorTotalJuros = valorTotalJuros;
    }

    public double getValorParcelaFixa() {
        return valorParcelaFixa;
    }

    public void setValorParcelaFixa(double valorParcelaFixa) {
        this.valorParcelaFixa = valorParcelaFixa;
    }

    public List<DetalheParcelaDTO> getTabelaAmortizacao() {
        return tabelaAmortizacao;
    }

    public void setTabelaAmortizacao(List<DetalheParcelaDTO> tabelaAmortizacao) {
        this.tabelaAmortizacao = tabelaAmortizacao;
    }


}