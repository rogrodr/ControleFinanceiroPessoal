package com.webbolso.backend.controller;

import com.webbolso.backend.dto.MetaDTO;
import com.webbolso.backend.dto.MetaResponseDTO; // Importe o novo DTO
import com.webbolso.backend.model.Meta;
import com.webbolso.backend.service.MetaService;
import com.webbolso.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
public class MetaController {

    @Autowired
    private MetaService metaService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Meta> createMeta(@RequestBody MetaDTO dto, Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        Meta meta = metaService.createMeta(userId, dto);
        return ResponseEntity.ok(meta);
    }

    // MODIFICADO: Agora retorna List<MetaResponseDTO>
    @GetMapping
    public ResponseEntity<List<MetaResponseDTO>> getMetas(Authentication authentication) {
        Long userId = userService.findByUsername(authentication.getName()).getId();
        // O serviço já retornará DTOs
        return ResponseEntity.ok(metaService.getUserMetas(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meta> updateMeta(@PathVariable Long id, @RequestBody MetaDTO dto) {
        Meta meta = metaService.updateMeta(id, dto);
        return ResponseEntity.ok(meta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeta(@PathVariable Long id) {
        metaService.deleteMeta(id);
        return ResponseEntity.ok().build();
    }
}