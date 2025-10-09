    package com.webbolso.backend.controller;

    import com.webbolso.backend.dto.DespesaDTO;
    import com.webbolso.backend.dto.DespesaResponseDTO; // Importe o novo DTO
    import com.webbolso.backend.model.Despesa;
    import com.webbolso.backend.service.DespesaService;
    import com.webbolso.backend.service.UserService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.web.bind.annotation.*;

    import java.time.Month;
    import java.util.List;
    import java.util.Map;

    @RestController
    @RequestMapping("/api/despesas")
    public class DespesaController {

        @Autowired
        private DespesaService despesaService;

        @Autowired
        private UserService userService;

        @PostMapping
        public ResponseEntity<Despesa> createDespesa(@RequestBody DespesaDTO dto, Authentication authentication) {
            Long userId = userService.findByUsername(authentication.getName()).getId();
            Despesa despesa = despesaService.createDespesa(userId, dto);
            return ResponseEntity.ok(despesa);
        }

        // MODIFICADO: Agora retorna List<DespesaResponseDTO>
        @GetMapping
        public ResponseEntity<List<DespesaResponseDTO>> getDespesas(Authentication authentication) {
            Long userId = userService.findByUsername(authentication.getName()).getId();
            // O serviço já retorna DTOs
            return ResponseEntity.ok(despesaService.getUserDespesas(userId));
        }

        @PutMapping("/{id}")
        public ResponseEntity<Despesa> updateDespesa(@PathVariable Long id, @RequestBody DespesaDTO dto) {
            Despesa despesa = despesaService.updateDespesa(id, dto);
            return ResponseEntity.ok(despesa);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteDespesa(@PathVariable Long id) {
            despesaService.deleteDespesa(id);
            return ResponseEntity.ok().build();
        }

        @GetMapping("/total")
        public ResponseEntity<Double> getTotalDespesas(Authentication authentication) {
            Long userId = userService.findByUsername(authentication.getName()).getId();
            return ResponseEntity.ok(despesaService.getTotalDespesas(userId));
        }

        @GetMapping("/por-categoria")
        public ResponseEntity<Map<String, Double>> getDespesasPorCategoria(Authentication authentication) {
            Long userId = userService.findByUsername(authentication.getName()).getId();
            return ResponseEntity.ok(despesaService.getDespesasPorCategoria(userId));
        }

        @GetMapping("/resumo-mensal")
        public ResponseEntity<Map<Month, Double>> getResumoMensal(
                    Authentication authentication,
                    @RequestParam(required = false) Integer year) {
            
            Long userId = userService.findByUsername(authentication.getName()).getId();
            
            // Se o ano não for fornecido, usa o ano atual
            int anoConsulta = (year != null) ? year : java.time.Year.now().getValue();
            
            return ResponseEntity.ok(despesaService.getResumoMensal(userId, anoConsulta));
        }

        @GetMapping("/por-periodo")
        public ResponseEntity<Map<String, Double>> getDespesasPorPeriodo(
                    Authentication authentication,
                    @RequestParam String periodo) { // "semana", "mes" ou "ano"
            
            Long userId = userService.findByUsername(authentication.getName()).getId();
            return ResponseEntity.ok(despesaService.getDespesasPorPeriodo(userId, periodo));
        }
    }