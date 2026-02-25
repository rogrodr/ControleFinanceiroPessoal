package com.webbolso.backend.controller;

import com.webbolso.backend.dto.SimulacaoRequestDTO;
import com.webbolso.backend.dto.SimulacaoResponseDTO;
import com.webbolso.backend.service.SimuladorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulador")
public class SimuladorController {

    @Autowired
    private SimuladorService simuladorService;

    @PostMapping("/emprestimo-price")
    public ResponseEntity<SimulacaoResponseDTO> simularEmprestimoPrice(@RequestBody SimulacaoRequestDTO request) {
        SimulacaoResponseDTO response = simuladorService.simularEmprestimoPrice(request);
        return ResponseEntity.ok(response);
    }
}