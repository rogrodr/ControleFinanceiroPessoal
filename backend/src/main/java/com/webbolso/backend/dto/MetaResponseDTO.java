 package com.webbolso.backend.dto;

    import java.time.LocalDate;

    public class MetaResponseDTO {
        private Long id;
        private String description;
        private Double targetAmount;
        private Double currentAmount;
        private String category;
        private LocalDate deadline;
        private UserResponseDTO user; // Usar o DTO simplificado para o usuário

        public MetaResponseDTO() {
        }

        public MetaResponseDTO(Long id, String description, Double targetAmount, Double currentAmount, String category, LocalDate deadline, UserResponseDTO user) {
            this.id = id;
            this.description = description;
            this.targetAmount = targetAmount;
            this.currentAmount = currentAmount;
            this.category = category;
            this.deadline = deadline;
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

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }
    }