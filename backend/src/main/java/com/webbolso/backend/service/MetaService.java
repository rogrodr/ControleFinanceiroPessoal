package com.webbolso.backend.service;

import com.webbolso.backend.dto.MetaDTO;
import com.webbolso.backend.dto.MetaResponseDTO; // Importe o novo DTO
import com.webbolso.backend.dto.UserResponseDTO; // Importe o DTO de Usuário simplificado
import com.webbolso.backend.model.Meta;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.MetaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; // Importar Collectors

@Service
public class MetaService {

    @Autowired
    private MetaRepository goalRepository; // Note: 'goalRepository' is used, keep consistency

    @Autowired
    private UserService userService;

    // Método auxiliar para converter Entidade Meta para MetaResponseDTO
    private MetaResponseDTO convertToMetaResponseDTO(Meta meta) {
        UserResponseDTO userDto = null;
        if (meta.getUser() != null) {
            userDto = new UserResponseDTO(meta.getUser().getId(), meta.getUser().getUsername(), meta.getUser().getEmail());
        }
        return new MetaResponseDTO(
            meta.getId(),
            meta.getDescription(),
            meta.getTargetAmount(),
            meta.getCurrentAmount(),
            meta.getCategory(),
            meta.getDeadline(),
            userDto // Passa o DTO simplificado do usuário
        );
    }

    public Meta createMeta(Long userId, MetaDTO dto) {
        User user = userService.findById(userId);
        Meta goal = new Meta();
        goal.setDescription(dto.getDescription());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setCategory(dto.getCategory());
        goal.setCurrentAmount(dto.getCurrentAmount());
        goal.setDeadline(dto.getDeadline());
        goal.setUser(user);
        return goalRepository.save(goal);
    }

    // MODIFICADO: Agora retorna List<MetaResponseDTO>
    public List<MetaResponseDTO> getUserMetas(Long userId) {
        List<Meta> metas = goalRepository.findByUserId(userId);
        System.out.println("MetaService: Tamanho da lista de metas retornada pelo repositório para o userId " + userId + ": " + metas.size());
        // Converte cada entidade Meta para MetaResponseDTO
        return metas.stream()
                       .map(this::convertToMetaResponseDTO)
                       .collect(Collectors.toList());
    }

    public Meta updateMeta(Long goalId, MetaDTO dto) {
        Meta goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Meta not found"));
        goal.setDescription(dto.getDescription());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setCategory(dto.getCategory());
        goal.setCurrentAmount(dto.getCurrentAmount());
        goal.setDeadline(dto.getDeadline());
        return goalRepository.save(goal);
    }

    public void deleteMeta(Long goalId) {
        goalRepository.deleteById(goalId);
    }
}