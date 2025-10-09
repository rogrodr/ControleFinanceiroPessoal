package com.webbolso.backend.controller;

import com.webbolso.backend.dto.LembreteDTO;
import com.webbolso.backend.dto.LembreteResponseDTO; // Importe o novo DTO
import com.webbolso.backend.model.Lembrete;
import com.webbolso.backend.service.LembreteService;
import com.webbolso.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lembretes")
public class LembreteController {

    @Autowired
    private LembreteService lembreteService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Lembrete> createLembrete(@RequestBody LembreteDTO dto, Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        Lembrete lembrete = lembreteService.createLembrete(userId, dto);
        return ResponseEntity.ok(lembrete);
    }

    // MODIFICADO: Agora retorna List<LembreteResponseDTO>
    @GetMapping
    public ResponseEntity<List<LembreteResponseDTO>> getLembretes(Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        // O serviço já retorna DTOs
        return ResponseEntity.ok(lembreteService.getUserLembretes(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lembrete> updateLembrete(@PathVariable Long id, @RequestBody LembreteDTO dto) {
        Lembrete lembrete = lembreteService.updateLembrete(id, dto);
        return ResponseEntity.ok(lembrete);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLembrete(@PathVariable Long id) {
        lembreteService.deleteLembrete(id);
        return ResponseEntity.ok().build();
    }
}