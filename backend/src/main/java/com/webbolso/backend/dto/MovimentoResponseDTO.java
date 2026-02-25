package com.webbolso.backend.dto;

import java.time.LocalDate;

// NOVO NOME: ContaResponseDTO
public class MovimentoResponseDTO {
    
    private Long id;
    private String description;
    private Double valor;
    private String category;
    private LocalDate date;
    
    // NOVOS CAMPOS ADICIONADOS
    private String tipo; // Ex: "DESPESA", "RECEITA"
    private String statusPagamento; // Ex: "A PAGAR", "PAGO", "A RECEBER", "RECEBIDO"
    private Integer totalParcelas;
    private Integer parcelaAtual;
    
    private UserResponseDTO user; 

    public MovimentoResponseDTO() {
    }

    // Construtor completo com os novos campos
    public MovimentoResponseDTO(Long id, String description, Double valor, String category, LocalDate date, String tipo, String statusPagamento, Integer totalParcelas, Integer parcelaAtual, UserResponseDTO user) {
        this.id = id;
        this.description = description;
        this.valor = valor;
        this.category = category;
        this.date = date;
        this.tipo = tipo; // Novo
        this.statusPagamento = statusPagamento; // Novo
        this.totalParcelas = totalParcelas; // Novo
        this.parcelaAtual = parcelaAtual; // Novo
        this.user = user;
    }

    // Getters and Setters (Adapte conforme o padrão da sua IDE, aqui estão apenas os novos)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
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

    // NOVOS GETTERS E SETTERS
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
    // FIM DOS NOVOS GETTERS E SETTERS

    public UserResponseDTO getUser() {
        return user;
    }

    public void setUser(UserResponseDTO user) {
        this.user = user;
    }
}