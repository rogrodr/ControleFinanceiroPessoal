package com.webbolso.backend.dto;

import java.time.LocalDate;

public class LembreteResponseDTO {
    private Long id;
    private String description;
    private LocalDate dueDate;
    private String category;
    private UserResponseDTO user;

    // --- CORREÇÃO: Renomeado para movimentoId ---
    private Long movimentoId; // << ALTERADO
    // --- FIM CORREÇÃO ---

    private String status;

    // Construtores
    public LembreteResponseDTO() { }

    // --- CORREÇÃO: Construtor atualizado ---
    public LembreteResponseDTO(Long id, String description, LocalDate dueDate, String category, UserResponseDTO user, Long movimentoId, String status) { // << ALTERADO
        this.id = id;
        this.description = description;
        this.dueDate = dueDate;
        this.category = category;
        this.user = user;
        this.movimentoId = movimentoId; // << ALTERADO
        this.status = status;
    }
    // --- FIM CORREÇÃO ---

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public UserResponseDTO getUser() { return user; }
    public void setUser(UserResponseDTO user) { this.user = user; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // --- CORREÇÃO: Getters/Setters renomeados ---
    public Long getMovimentoId() { return movimentoId; } // << ALTERADO
    public void setMovimentoId(Long movimentoId) { this.movimentoId = movimentoId; } // << ALTERADO
    // --- FIM CORREÇÃO ---
}