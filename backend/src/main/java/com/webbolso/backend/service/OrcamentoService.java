package com.webbolso.backend.service;

import com.webbolso.backend.dto.OrcamentoDTO;
import com.webbolso.backend.dto.OrcamentoResponseDTO; // Importe o novo DTO
import com.webbolso.backend.dto.UserResponseDTO; // Importe o DTO de Usuário simplificado
import com.webbolso.backend.model.Orcamento;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; // Importar Collectors

@Service
public class OrcamentoService {

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    @Autowired
    private UserService userService;

    // Método auxiliar para converter Entidade Orcamento para OrcamentoResponseDTO
    private OrcamentoResponseDTO convertToOrcamentoResponseDTO(Orcamento orcamento) {
        UserResponseDTO userDto = null;
        if (orcamento.getUser() != null) {
            userDto = new UserResponseDTO(orcamento.getUser().getId(), orcamento.getUser().getUsername(), orcamento.getUser().getEmail());
        }
        return new OrcamentoResponseDTO(
            orcamento.getId(),
            orcamento.getDescription(),
            orcamento.getCategory(),
            orcamento.getPlannedAmount(),
            orcamento.getPeriod(),
            userDto // Passa o DTO simplificado do usuário
        );
    }

    public Orcamento createOrcamento(Long userId, OrcamentoDTO dto) {
        User user = userService.findById(userId);
        Orcamento orcamento = new Orcamento();
        orcamento.setDescription(dto.getDescription());
        orcamento.setPlannedAmount(dto.getPlannedAmount());
        orcamento.setCategory(dto.getCategory());
        orcamento.setPeriod(dto.getPeriod());
        orcamento.setUser(user);
        return orcamentoRepository.save(orcamento);
    }

    // MODIFICADO: Agora retorna List<OrcamentoResponseDTO>
    public List<OrcamentoResponseDTO> getUserOrcamentos(Long userId) {
        List<Orcamento> orcamentos = orcamentoRepository.findByUserId(userId);
        System.out.println("OrcamentoService: Tamanho da lista de orçamentos retornada pelo repositório para o userId " + userId + ": " + orcamentos.size());
        // Converte cada entidade Orcamento para OrcamentoResponseDTO
        return orcamentos.stream()
                       .map(this::convertToOrcamentoResponseDTO)
                       .collect(Collectors.toList());
    }

    public Orcamento updateOrcamento(Long id, OrcamentoDTO dto) {
        Orcamento orcamento = orcamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orçamento não encontrado"));
        orcamento.setDescription(dto.getDescription());
        orcamento.setPlannedAmount(dto.getPlannedAmount());
        orcamento.setCategory(dto.getCategory());
        orcamento.setPeriod(dto.getPeriod());
        return orcamentoRepository.save(orcamento);
    }

    public void deleteOrcamento(Long id) {
        orcamentoRepository.deleteById(id);
    }
}