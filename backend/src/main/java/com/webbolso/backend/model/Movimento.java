package com.webbolso.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "movimentos")
public class Movimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... (campos user, description, valor, category, date, tipo, statusPagamento, totalParcelas, parcelaAtual, emprestimoId) ...
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private Double valor; // Valor total da parcela
    @Column(nullable = false) private String category;
    @Column(nullable = false) private LocalDate date;
    @Column(nullable = false) private String tipo;
    @Column(name = "status_pagamento", nullable = false) private String statusPagamento;
    private Integer totalParcelas;
    private Integer parcelaAtual;
    @Column(name = "emprestimo_id", nullable = true) private Long emprestimoId;

    // --- NOVO CAMPO ---
    // Guarda o valor da amortização desta parcela específica
    @Column(name = "valor_amortizacao", nullable = true) // Nullable pois nem todo movimento é parcela
    private Double valorAmortizacao;
    // --- FIM NOVO CAMPO ---

    // Getters e Setters para TODOS os campos, incluindo valorAmortizacao
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getValor() { return valor; } // Valor total da parcela
    public void setValor(Double valor) { this.valor = valor; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getStatusPagamento() { return statusPagamento; }
    public void setStatusPagamento(String statusPagamento) { this.statusPagamento = statusPagamento; }
    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }
    public Integer getParcelaAtual() { return parcelaAtual; }
    public void setParcelaAtual(Integer parcelaAtual) { this.parcelaAtual = parcelaAtual; }
    public Long getEmprestimoId() { return emprestimoId; }
    public void setEmprestimoId(Long emprestimoId) { this.emprestimoId = emprestimoId; }

    // --- NOVO GETTER/SETTER ---
    public Double getValorAmortizacao() { return valorAmortizacao; }
    public void setValorAmortizacao(Double valorAmortizacao) { this.valorAmortizacao = valorAmortizacao; }
    // --- FIM ---
}