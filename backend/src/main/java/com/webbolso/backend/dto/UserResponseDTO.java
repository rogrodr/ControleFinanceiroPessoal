package com.webbolso.backend.dto;

    import java.util.List; // Importar se você quiser, por exemplo, um ID do usuário pai, mas não as coleções
    // import lombok.AllArgsConstructor; // Opcional, se usando Lombok
    // import lombok.Data; // Opcional, se usando Lombok
    // import lombok.NoArgsConstructor; // Opcional, se usando Lombok

    public class UserResponseDTO {
        private Long id;
        private String username;
        private String email;

        // Construtor padrão (necessário para serialização/desserialização JSON)
        public UserResponseDTO() {
        }

        // Construtor com todos os campos
        public UserResponseDTO(Long id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }

        // Getters e Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }