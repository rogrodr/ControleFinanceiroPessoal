package com.webbolso.backend.controller;

import com.webbolso.backend.dto.EmprestimoFinanciamentoDTO;
// REMOVED: import com.webbolso.backend.dto.PagamentoEmprestimoDTO;
import com.webbolso.backend.model.EmprestimoFinanciamento;
// REMOVED: import com.webbolso.backend.model.PagamentoEmprestimo;
import com.webbolso.backend.model.User;
import com.webbolso.backend.service.EmprestimoFinanciamentoService;
import com.webbolso.backend.service.UserService;
import jakarta.persistence.EntityNotFoundException; // Good practice to handle potential not found
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emprestimos") // Endpoint base consistent com frontend
public class EmprestimoFinanciamentoController {

    @Autowired
    private EmprestimoFinanciamentoService emprestimoFinanciamentoService;

    @Autowired
    private UserService userService;

    // Método 'findUser' para evitar repetição
    private User findUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            // Lançar exceção ou tratar caso não autenticado apropriadamente
            throw new SecurityException("Usuário não autenticado.");
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            throw new EntityNotFoundException("Usuário não encontrado para o token atual.");
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<EmprestimoFinanciamento> createEmprestimo(
            @RequestBody EmprestimoFinanciamentoDTO dto,
            Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Chama o método correto no service ---
        EmprestimoFinanciamento emprestimo = emprestimoFinanciamentoService.createEmprestimoFinanciamento(userId, dto);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok(emprestimo);
    }

    @GetMapping
    public ResponseEntity<List<EmprestimoFinanciamento>> getUserEmprestimos(Authentication authentication) {
        Long userId = findUser(authentication).getId();
        List<EmprestimoFinanciamento> emprestimos = emprestimoFinanciamentoService.getUserEmprestimos(userId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmprestimoFinanciamento> getEmprestimoById(@PathVariable Long id, Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // Idealmente, o service verifica se este ID pertence ao userId
        EmprestimoFinanciamento emprestimo = emprestimoFinanciamentoService.getEmprestimoByIdAndUserId(id, userId); // Supõe que o service tenha esse método
        // Se o service não tiver, buscar e verificar aqui:
        // EmprestimoFinanciamento emprestimo = emprestimoFinanciamentoService.getEmprestimoById(id); // Busca normal
        // if (emprestimo == null || !emprestimo.getUser().getId().equals(userId)) {
        //     throw new EntityNotFoundException("Empréstimo não encontrado ou não pertence ao usuário.");
        // }
        return ResponseEntity.ok(emprestimo);
    }

    // --- REMOVED: Endpoint @PostMapping("/{emprestimoId}/pagamento") foi removido ---


    @PutMapping("/{id}")
    public ResponseEntity<EmprestimoFinanciamento> updateEmprestimo(
            @PathVariable Long id,
            @RequestBody EmprestimoFinanciamentoDTO dto,
            Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa o userId para o service fazer a verificação ---
        // Certifique-se que o método no service aceita e usa o userId!
        EmprestimoFinanciamento emprestimo = emprestimoFinanciamentoService.updateEmprestimo(id, dto, userId);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok(emprestimo);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmprestimo(@PathVariable Long id, Authentication authentication) {
        Long userId = findUser(authentication).getId();
        // --- CORREÇÃO: Passa o userId para o service fazer a verificação ---
        // Certifique-se que o método no service aceita e usa o userId!
        emprestimoFinanciamentoService.deleteEmprestimo(id, userId);
        // --- FIM DA CORREÇÃO ---
        return ResponseEntity.ok().build();
    }


    @GetMapping("/saldo-devedor-total")
    public ResponseEntity<Map<String, Double>> getTotalSaldoDevedor(Authentication authentication) {
        Long userId = findUser(authentication).getId();
        double total = emprestimoFinanciamentoService.getTotalSaldoDevedor(userId);
        // Retorna no formato esperado pelo frontend
        return ResponseEntity.ok(Map.of("totalSaldoDevedor", total));
    }
}