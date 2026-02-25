package com.webbolso.backend.dto;

import java.time.LocalDate;

public class EmprestimoFinanciamentoDTO {
    private String description;
    private double valorTotal;
    private LocalDate dataContratacao;
    private int totalParcelas;
    private String categoria;
    private double valorParcela; // Valor fixo da parcela Price
    private LocalDate dataPrimeiraParcela;

    // --- NOVO CAMPO ---
    private double taxaJurosMensal; // Taxa de juros em %, ex: 1.5
    // --- FIM NOVO CAMPO ---

    // Getters e Setters para todos os campos
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getValorTotal() { return valorTotal; }
    public void setValorTotal(double valorTotal) { this.valorTotal = valorTotal; }
    public LocalDate getDataContratacao() { return dataContratacao; }
    public void setDataContratacao(LocalDate dataContratacao) { this.dataContratacao = dataContratacao; }
    public int getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(int totalParcelas) { this.totalParcelas = totalParcelas; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public double getValorParcela() { return valorParcela; }
    public void setValorParcela(double valorParcela) { this.valorParcela = valorParcela; }
    public LocalDate getDataPrimeiraParcela() { return dataPrimeiraParcela; }
    public void setDataPrimeiraParcela(LocalDate dataPrimeiraParcela) { this.dataPrimeiraParcela = dataPrimeiraParcela; }

    // --- NOVO GETTER/SETTER ---
    public double getTaxaJurosMensal() { return taxaJurosMensal; }
    public void setTaxaJurosMensal(double taxaJurosMensal) { this.taxaJurosMensal = taxaJurosMensal; }
    // --- FIM ---
}