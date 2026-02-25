package com.webbolso.backend.dto;

public class DetalheParcelaDTO {
    private int numeroParcela;
    private double saldoDevedorInicial;
    private double valorJuros;
    private double valorAmortizacao;
    private double valorParcela;
    private double saldoDevedorFinal;

    public int getNumeroParcela() {
        return numeroParcela;
    }

    public void setNumeroParcela(int numeroParcela) {
        this.numeroParcela = numeroParcela;
    }

    public double getSaldoDevedorInicial() {
        return saldoDevedorInicial;
    }

    public void setSaldoDevedorInicial(double saldoDevedorInicial) {
        this.saldoDevedorInicial = saldoDevedorInicial;
    }

    public double getValorJuros() {
        return valorJuros;
    }

    public void setValorJuros(double valorJuros) {
        this.valorJuros = valorJuros;
    }

    public double getValorAmortizacao() {
        return valorAmortizacao;
    }

    public void setValorAmortizacao(double valorAmortizacao) {
        this.valorAmortizacao = valorAmortizacao;
    }

    public double getValorParcela() {
        return valorParcela;
    }

    public void setValorParcela(double valorParcela) {
        this.valorParcela = valorParcela;
    }

    public double getSaldoDevedorFinal() {
        return saldoDevedorFinal;
    }

    public void setSaldoDevedorFinal(double saldoDevedorFinal) {
        this.saldoDevedorFinal = saldoDevedorFinal;
    }


}