package com.webbolso.backend.dto;

import java.time.LocalDate;

public class LembreteDTO {
    private String description;
    private LocalDate dueDate;
    private String category;

    // --- CORREÇÃO: Renomeado para movimentoId ---
    private Long movimentoId; // << ALTERADO
    // --- FIM CORREÇÃO ---

    // Getters e Setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    // --- CORREÇÃO: Getters/Setters renomeados ---
    public Long getMovimentoId() { return movimentoId; } // << ALTERADO
    public void setMovimentoId(Long movimentoId) { this.movimentoId = movimentoId; } // << ALTERADO
    // --- FIM CORREÇÃO ---
}