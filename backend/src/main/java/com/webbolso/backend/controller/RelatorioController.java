package com.webbolso.backend.controller;

import com.webbolso.backend.service.JasperReportService;
import com.webbolso.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @Autowired
    private JasperReportService jasperReportService;

    @Autowired
    private UserService userService;

    /**
     * Endpoint para gerar relatório PDF de movimentos
     * 
     * GET /api/relatorios/movimentos/pdf
     * 
     * Query Parameters (todos opcionais):
     * - dataInicio: Data inicial (formato: yyyy-MM-dd)
     * - dataFim: Data final (formato: yyyy-MM-dd)
     * - tipo: DESPESA, RECEITA ou vazio para todos
     * 
     * Exemplo: /api/relatorios/movimentos/pdf?dataInicio=2024-01-01&dataFim=2024-12-31&tipo=DESPESA
     */
    @GetMapping("/movimentos/pdf")
    public ResponseEntity<byte[]> gerarRelatorioPDF(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String tipo) {
        
        try {
            // Pega o ID do usuário autenticado
            Long userId = userService.findByUsername(authentication.getName()).getId();
            
            // Gera o relatório
            byte[] pdfBytes = jasperReportService.gerarRelatorioPDF(userId, dataInicio, dataFim, tipo);
            
            // Prepara o nome do arquivo
            String nomeArquivo = "movimentos_" + LocalDate.now() + ".pdf";
            
            // Configura headers para download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", nomeArquivo);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Erro ao gerar relatório: " + e.getMessage()).getBytes());
        }
    }

    /**
     * Endpoint para visualizar o PDF no navegador (sem download)
     */
    @GetMapping("/movimentos/pdf/preview")
    public ResponseEntity<byte[]> visualizarRelatorioPDF(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String tipo) {
        
        try {
            Long userId = userService.findByUsername(authentication.getName()).getId();
            byte[] pdfBytes = jasperReportService.gerarRelatorioPDF(userId, dataInicio, dataFim, tipo);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // inline = abre no navegador, attachment = download
            headers.setContentDispositionFormData("inline", "movimentos.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}