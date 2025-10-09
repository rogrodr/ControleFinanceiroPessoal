package com.webbolso.backend.service;

import com.webbolso.backend.dto.LembreteDTO;
import com.webbolso.backend.dto.LembreteResponseDTO; // Importe o novo DTO
import com.webbolso.backend.dto.UserResponseDTO; // Importe o DTO de Usuário simplificado
import com.webbolso.backend.model.Lembrete;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.LembreteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; // Importar Collectors

@Service
public class LembreteService {

    @Autowired
    private LembreteRepository lembreteRepository;

    @Autowired
    private UserService userService;

    // Método auxiliar para converter Entidade Lembrete para LembreteResponseDTO
    private LembreteResponseDTO convertToLembreteResponseDTO(Lembrete lembrete) {
        UserResponseDTO userDto = null;
        if (lembrete.getUser() != null) {
            userDto = new UserResponseDTO(lembrete.getUser().getId(), lembrete.getUser().getUsername(), lembrete.getUser().getEmail());
        }
        return new LembreteResponseDTO(
            lembrete.getId(),
            lembrete.getDescription(),
            lembrete.getDueDate(),
            lembrete.getCategory(),
            userDto // Passa o DTO simplificado do usuário
        );
    }

    public Lembrete createLembrete(Long userId, LembreteDTO dto) {
        User user = userService.findById(userId);
        Lembrete lembrete = new Lembrete();
        lembrete.setDescription(dto.getDescription());
        lembrete.setDueDate(dto.getDueDate());
        lembrete.setCategory(dto.getCategory());
        lembrete.setUser(user);
        return lembreteRepository.save(lembrete);
    }

    // MODIFICADO: Agora retorna List<LembreteResponseDTO>
    public List<LembreteResponseDTO> getUserLembretes(Long userId) {
        List<Lembrete> lembretes = lembreteRepository.findByUserId(userId);
        System.out.println("LembreteService: Tamanho da lista de lembretes retornada pelo repositório para o userId " + userId + ": " + lembretes.size());
        // Converte cada entidade Lembrete para LembreteResponseDTO
        return lembretes.stream()
                       .map(this::convertToLembreteResponseDTO)
                       .collect(Collectors.toList());
    }

    public Lembrete updateLembrete(Long lembreteId, LembreteDTO dto) {
        Lembrete lembrete = lembreteRepository.findById(lembreteId)
                .orElseThrow(() -> new RuntimeException("Lembrete não encontrado"));
        lembrete.setDescription(dto.getDescription());
        lembrete.setDueDate(dto.getDueDate());
        lembrete.setCategory(dto.getCategory());
        return lembreteRepository.save(lembrete);
    }

    public void deleteLembrete(Long lembreteId) {
        lembreteRepository.deleteById(lembreteId);
    }
}