package com.webbolso.backend.controller;

import com.webbolso.backend.dto.MovimentoDTO;
import com.webbolso.backend.dto.MovimentoResponseDTO;
import com.webbolso.backend.model.Movimento;
import com.webbolso.backend.model.User;
import com.webbolso.backend.service.MovimentoService;
import com.webbolso.backend.service.UserService;
import jakarta.persistence.EntityNotFoundException; // Importar
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Month;
import java.time.Year;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movimentos")
public class MovimentoController {

    @Autowired
    private MovimentoService movimentoService;

    @Autowired
    private UserService userService;

    // Método 'findUser' aprimorado para checar autenticação
    private User findUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Usuário não autenticado.");
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            // Lançar EntityNotFound é razoável aqui, pois indica um problema de dados/token
            throw new EntityNotFoundException("Usuário associado ao token não encontrado.");
        }
        return user;
    }

    // ------------------- CRUD BÁSICO -------------------

    @PostMapping
    public ResponseEntity<List<Movimento>> createMovimento(@RequestBody MovimentoDTO dto, Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // O createMovimento no service não precisa do userId como argumento explícito
        // pois ele busca o User internamente usando o ID.
        List<Movimento> movimentos = movimentoService.createMovimento(userId, dto);
        // Retornar DTO seria mais consistente, mas List<Movimento> funciona se necessário
        return ResponseEntity.ok(movimentos);
        // Alternativa retornando DTO:
        // List<MovimentoResponseDTO> dtos = movimentoService.createMovimento(userId, dto).stream()
        //         .map(movimentoService::mapToMovimentoResponseDTO) // Precisa que map seja público ou ter DTO no retorno
        //         .collect(Collectors.toList());
        // return ResponseEntity.ok(dtos);
    }

    @GetMapping
    public ResponseEntity<List<MovimentoResponseDTO>> getMovimentos(Authentication authentication) {
        Long userId = findUser(authentication).getId();
        return ResponseEntity.ok(movimentoService.getUserMovimentos(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimentoResponseDTO> getMovimentoById(@PathVariable Long id, Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa userId para o service verificar posse ---
        // Supõe que o service tenha um método que busca por id E userId
        MovimentoResponseDTO movimento = movimentoService.getMovimentoByIdAndUserId(id, userId);
        // Se não tiver, a lógica de verificação deve estar aqui ou no service getMovimentoById
        // MovimentoResponseDTO movimento = movimentoService.getMovimentoById(id);
        // if (movimento == null || movimento.getUser() == null || !movimento.getUser().id().equals(userId)) {
        //     throw new EntityNotFoundException("Movimento não encontrado ou não pertence ao usuário.");
        // }
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok(movimento);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimentoResponseDTO> updateMovimento(
            @PathVariable Long id,
            @RequestBody MovimentoDTO dto,
            Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa userId para o service ---
        MovimentoResponseDTO movimento = movimentoService.updateMovimento(id, dto, userId);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok(movimento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovimento(
            @PathVariable Long id,
            Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa userId para o service ---
        movimentoService.deleteMovimento(id, userId);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok().build();
    }

    // ------------------- AÇÕES ESPECÍFICAS -------------------

    @PutMapping("/{id}/status")
    public ResponseEntity<MovimentoResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) { // Adicionado Authentication
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa userId para o service ---
        MovimentoResponseDTO movimentoAtualizado = movimentoService.pagarReceberMovimento(id, status, userId);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok(movimentoAtualizado);
    }

    // ------------------- ENDPOINTS DE ANÁLISE/RELATÓRIOS -------------------
    // (Estes métodos já estavam corretos, pois usam userId para buscar dados agregados)

    @GetMapping("/total")
    public ResponseEntity<Double> getTotalValor(
            Authentication authentication,
            @RequestParam(required = false) String tipo) {
        Long userId = findUser(authentication).getId();
        return ResponseEntity.ok(movimentoService.getTotalValor(userId, tipo));
    }

    @GetMapping("/por-categoria")
    public ResponseEntity<Map<String, Double>> getDespesasPorCategoria(
            Authentication authentication,
            @RequestParam(required = false) String tipo) {
        Long userId = findUser(authentication).getId();
        return ResponseEntity.ok(movimentoService.getDespesasPorCategoria(userId, tipo));
    }

    @GetMapping("/resumo-mensal")
    public ResponseEntity<Map<Month, Double>> getResumoMensal(
            Authentication authentication,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String tipo) {
        Long userId = findUser(authentication).getId();
        int anoConsulta = (year != null) ? year : Year.now().getValue();
        return ResponseEntity.ok(movimentoService.getResumoMensal(userId, anoConsulta, tipo));
    }

    @GetMapping("/por-periodo")
    public ResponseEntity<Map<String, Double>> getMovimentosPorPeriodo(
            Authentication authentication,
            @RequestParam String periodo) {
        Long userId = findUser(authentication).getId();
        return ResponseEntity.ok(movimentoService.getMovimentosPorPeriodo(userId, periodo));
    }
}