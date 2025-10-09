package com.webbolso.backend.dto;

    import java.time.LocalDate;


    public class DespesaResponseDTO {
        private Long id;
        private String description;
        private Double valor;
        private String category;
        private LocalDate date;
        private UserResponseDTO user; // Usar o DTO simplificado para o usuário

        public DespesaResponseDTO() {
        }

        public DespesaResponseDTO(Long id, String description, Double valor, String category, LocalDate date, UserResponseDTO user) {
            this.id = id;
            this.description = description;
            this.valor = valor;
            this.category = category;
            this.date = date;
            this.user = user;
        }

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

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }
    }