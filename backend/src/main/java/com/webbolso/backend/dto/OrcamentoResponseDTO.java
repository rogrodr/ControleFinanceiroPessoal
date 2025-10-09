package com.webbolso.backend.dto;

    public class OrcamentoResponseDTO {
        private Long id;
        private String description;
        private String category;
        private Double plannedAmount;
        private String period;
        private UserResponseDTO user; // Usar o DTO simplificado para o usuário

        public OrcamentoResponseDTO() {
        }

        public OrcamentoResponseDTO(Long id, String description, String category, Double plannedAmount, String period, UserResponseDTO user) {
            this.id = id;
            this.description = description;
            this.category = category;
            this.plannedAmount = plannedAmount;
            this.period = period;
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

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Double getPlannedAmount() {
            return plannedAmount;
        }

        public void setPlannedAmount(Double plannedAmount) {
            this.plannedAmount = plannedAmount;
        }

        public String getPeriod() {
            return period;
        }

        public void setPeriod(String period) {
            this.period = period;
        }

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }
    }