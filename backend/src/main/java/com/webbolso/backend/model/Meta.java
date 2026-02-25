package com.webbolso.backend.model;

import jakarta.persistence.*;
// import javax.persistence.*; // (Use este se estiver no Spring Boot 2)
import java.time.LocalDate;

@Entity
@Table(name = "metas")
public class Meta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double targetAmount; // Use Double (objeto) para permitir nulo, se quiser

    @Column(nullable = false)
    private Double currentAmount;

    private String category;
    private LocalDate deadline;

    // --- CAMPO NOVO (BANCO DE DADOS) ---
    @Column(name = "categoria_associada", nullable = true) // Permite ser nulo
    private String categoriaAssociada;

    // Getters e Setters (para todos os campos)
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Double getTargetAmount() {
        return targetAmount;
    }
    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }
    public Double getCurrentAmount() {
        return currentAmount;
    }
    public void setCurrentAmount(Double currentAmount) {
        this.currentAmount = currentAmount;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
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