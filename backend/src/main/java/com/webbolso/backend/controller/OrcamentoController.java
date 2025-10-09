package com.webbolso.backend.controller;

import com.webbolso.backend.dto.OrcamentoDTO;
import com.webbolso.backend.dto.OrcamentoResponseDTO; // Importe o novo DTO
import com.webbolso.backend.model.Orcamento;
import com.webbolso.backend.service.OrcamentoService;
import com.webbolso.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    @Autowired
    private OrcamentoService orcamentoService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Orcamento> createOrcamento(@RequestBody OrcamentoDTO dto, Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        Orcamento orcamento = orcamentoService.createOrcamento(userId, dto);
        return ResponseEntity.ok(orcamento);
    }

    // MODIFICADO: Agora retorna List<OrcamentoResponseDTO>
    @GetMapping
    public ResponseEntity<List<OrcamentoResponseDTO>> getOrcamentos(Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        // O serviço já retornará DTOs
        return ResponseEntity.ok(orcamentoService.getUserOrcamentos(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orcamento> updateOrcamento(@PathVariable Long id, @RequestBody OrcamentoDTO dto) {
        Orcamento orcamento = orcamentoService.updateOrcamento(id, dto);
        return ResponseEntity.ok(orcamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrcamento(@PathVariable Long id) {
        orcamentoService.deleteOrcamento(id);
        return ResponseEntity.ok().build();
    }
}