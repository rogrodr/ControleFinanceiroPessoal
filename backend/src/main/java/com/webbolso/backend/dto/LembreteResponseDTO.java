 package com.webbolso.backend.dto;

    import java.time.LocalDate;

    public class LembreteResponseDTO {
        private Long id;
        private String description;
        private LocalDate dueDate;
        private String category;
        private UserResponseDTO user; // Usar o DTO simplificado para o usuário

        public LembreteResponseDTO() {
        }

        public LembreteResponseDTO(Long id, String description, LocalDate dueDate, String category, UserResponseDTO user) {
            this.id = id;
            this.description = description;
            this.dueDate = dueDate;
            this.category = category;
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

        public LocalDate getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }
    }