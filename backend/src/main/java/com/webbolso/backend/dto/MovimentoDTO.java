package com.webbolso.backend.dto;

import java.time.LocalDate;

public class MovimentoDTO {
    private String description;
    private Double valor; // CORRIGIDO: De 'double' para 'Double'
    private String category;
    private LocalDate date;
    
    // NOVOS CAMPOS
    private String tipo; // "DESPESA" ou "RECEITA"
    private String statusPagamento; // "A PAGAR", "PAGO", "A RECEBER", "RECEBIDO"
    private Integer totalParcelas;
    private Integer parcelaAtual;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getValor() { // CORRIGIDO: Retorna Double
        return valor;
    }

    public void setValor(Double valor) { // CORRIGIDO: Recebe Double
        this.valor = valor;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(String statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public Integer getTotalParcelas() {
        return totalParcelas;
    }

    public void setTotalParcelas(Integer totalParcelas) {
        this.totalParcelas = totalParcelas;
    }

    public Integer getParcelaAtual() {
        return parcelaAtual;
    }

    public void setParcelaAtual(Integer parcelaAtual) {
        this.parcelaAtual = parcelaAtual;
    }
}