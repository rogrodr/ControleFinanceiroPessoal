package com.webbolso.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "emprestimos_financiamentos")
public class EmprestimoFinanciamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false) 
    private Double valorTotal;
    
    @Column(nullable = false) 
    private Double saldoDevedor;
    
    @Column(nullable = false) 
    private LocalDate dataContratacao;
    
    @Column(nullable = false) 
    private Integer totalParcelas;
    
    @Column(nullable = false) 
    private Integer parcelasPagas;
    
    @Column(nullable = false) 
    private String status;
    
    @Column(nullable = false) 
    private String categoria;
    
    @Column(name = "taxa_juros_mensal", nullable = false) 
    private Double taxaJurosMensal;

    // ====================================
    // RELACIONAMENTO COM PagamentoEmprestimo REMOVIDO
    // O sistema agora usa apenas Movimentos para gerenciar pagamentos
    // ====================================

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }
    
    public Double getSaldoDevedor() { return saldoDevedor; }
    public void setSaldoDevedor(Double saldoDevedor) { this.saldoDevedor = saldoDevedor; }
    
    public LocalDate getDataContratacao() { return dataContratacao; }
    public void setDataContratacao(LocalDate dataContratacao) { this.dataContratacao = dataContratacao; }
    
    public Integer getTotalParcelas() { return totalParcelas; }
    public void setTotalParcelas(Integer totalParcelas) { this.totalParcelas = totalParcelas; }
    
    public Integer getParcelasPagas() { return parcelasPagas; }
    public void setParcelasPagas(Integer parcelasPagas) { this.parcelasPagas = parcelasPagas; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Double getTaxaJurosMensal() { return taxaJurosMensal; }
    public void setTaxaJurosMensal(Double taxaJurosMensal) { this.taxaJurosMensal = taxaJurosMensal; }
}