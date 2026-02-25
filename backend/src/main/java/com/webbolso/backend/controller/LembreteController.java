package com.webbolso.backend.controller;

import com.webbolso.backend.dto.LembreteDTO;
import com.webbolso.backend.dto.LembreteResponseDTO;
import com.webbolso.backend.model.Lembrete; // Ainda necessário para o create
import com.webbolso.backend.model.User;
import com.webbolso.backend.service.LembreteService;
import com.webbolso.backend.service.UserService;
import jakarta.persistence.EntityNotFoundException; // Importar
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lembretes")
public class LembreteController {

    @Autowired private LembreteService lembreteService;
    @Autowired private UserService userService;

    // Método 'findUser' para evitar repetição
    private User findUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Usuário não autenticado.");
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            throw new EntityNotFoundException("Usuário associado ao token não encontrado.");
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<Lembrete> createLembrete(@RequestBody LembreteDTO dto, Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // O service create ainda retorna a entidade Lembrete
        Lembrete lembrete = lembreteService.createLembrete(userId, dto);
        return ResponseEntity.ok(lembrete);
    }

    @GetMapping
    public ResponseEntity<List<LembreteResponseDTO>> getLembretes(Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // O service getUserLembretes já retorna a lista de DTOs
        return ResponseEntity.ok(lembreteService.getUserLembretes(userId));
    }

    // --- CORREÇÃO NO PUT ---
    @PutMapping("/{id}")
    public ResponseEntity<LembreteResponseDTO> updateLembrete( // Agora retorna LembreteResponseDTO
            @PathVariable Long id,
            @RequestBody LembreteDTO dto,
            Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId(); // Pega o userId
        // Chama o service passando o userId e recebe o DTO atualizado
        LembreteResponseDTO lembreteAtualizado = lembreteService.updateLembrete(id, dto, userId);
        return ResponseEntity.ok(lembreteAtualizado); // Retorna o DTO
    }
    // --- FIM DA CORREÇÃO ---

    // --- CORREÇÃO NO DELETE ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLembrete(
            @PathVariable Long id,
            Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId(); // Pega o userId
        lembreteService.deleteLembrete(id, userId); // Chama o service passando o userId
        return ResponseEntity.ok().build();
    }
    // --- FIM DA CORREÇÃO ---

    // Endpoint PATCH para concluir (já deve estar correto da alteração anterior)
    @PatchMapping("/{id}/concluir")
    public ResponseEntity<LembreteResponseDTO> marcarComoConcluido(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = findUser(authentication).getId();
        LembreteResponseDTO lembreteConcluido = lembreteService.marcarComoConcluido(id, userId);
        return ResponseEntity.ok(lembreteConcluido);
    }
}