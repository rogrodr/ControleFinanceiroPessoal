package com.webbolso.backend.dto;

import java.time.LocalDate;

public class MetaDTO {
    private String description;
    private double targetAmount;
    private String category;
    private double currentAmount;
    private LocalDate deadline;
    
    // --- CAMPO NOVO ---
    // Categoria da 'Conta' (Receita) que irá contribuir para esta meta
    private String categoriaAssociada; 

    // Getters and Setters
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public double getTargetAmount() {
        return targetAmount;
    }
    public void setTargetAmount(double targetAmount) {
        this.targetAmount = targetAmount;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public double getCurrentAmount() {
        return currentAmount;
    }
    public void setCurrentAmount(double currentAmount) {
        this.currentAmount = currentAmount;
    }
    public LocalDate getDeadline() {
        return deadline;
    }
    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }
    
    // --- GETTER E SETTER NOVOS ---
    public String getCategoriaAssociada() {
        return categoriaAssociada;
    }
    public void setCategoriaAssociada(String categoriaAssociada) {
        this.categoriaAssociada = categoriaAssociada;
    }
}