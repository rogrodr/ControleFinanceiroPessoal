package com.webbolso.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lembretes")
public class Lembrete {

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
    private LocalDate dueDate;

    private String category;

    // --- CORREÇÃO: Renomeado coluna e campo ---
    @Column(name = "movimento_id", nullable = true) // << NOME DA COLUNA ALTERADO
    private Long movimentoId; // << NOME DO CAMPO ALTERADO
    // --- FIM CORREÇÃO ---

    @Column(nullable = false)
    private String status;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // --- CORREÇÃO: Getters/Setters renomeados ---
    public Long getMovimentoId() { return movimentoId; } // << ALTERADO
    public void setMovimentoId(Long movimentoId) { this.movimentoId = movimentoId; } // << ALTERADO
    // --- FIM CORREÇÃO ---
}