package com.webbolso.backend.service;

import com.webbolso.backend.dto.MetaDTO;
import com.webbolso.backend.dto.MetaResponseDTO;
import com.webbolso.backend.dto.UserResponseDTO;
import com.webbolso.backend.model.Meta;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.MetaRepository;
import com.webbolso.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
// import javax.persistence.EntityNotFoundException; // (Use este se estiver no Spring Boot 2)

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetaService {

    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private UserRepository userRepository;

    public Meta createMeta(Long userId, MetaDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        
        Meta meta = new Meta();
        meta.setUser(user);
        meta.setDescription(dto.getDescription());
        meta.setTargetAmount(dto.getTargetAmount());
        meta.setCurrentAmount(dto.getCurrentAmount());
        meta.setCategory(dto.getCategory());
        meta.setDeadline(dto.getDeadline());
        
        // --- LÓGICA NOVA ---
        // Se a categoria associada for vazia (""), salva como null no banco
        if (dto.getCategoriaAssociada() != null && !dto.getCategoriaAssociada().isEmpty()) {
            meta.setCategoriaAssociada(dto.getCategoriaAssociada());
        } else {
            meta.setCategoriaAssociada(null);
        }
        // --- FIM DA LÓGICA ---

        return metaRepository.save(meta);
    }

    public List<MetaResponseDTO> getUserMetas(Long userId) {
        return metaRepository.findByUserId(userId).stream()
                .map(this::mapToMetaResponseDTO)
                .collect(Collectors.toList());
    }

    public Meta updateMeta(Long id, MetaDTO dto) {
        Meta meta = metaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada"));
        
        // (Aqui você deve adicionar uma verificação se a meta pertence ao usuário logado)

        meta.setDescription(dto.getDescription());
        meta.setTargetAmount(dto.getTargetAmount());
        meta.setCurrentAmount(dto.getCurrentAmount());
        meta.setCategory(dto.getCategory());
        meta.setDeadline(dto.getDeadline());

        // --- LÓGICA NOVA ---
        if (dto.getCategoriaAssociada() != null && !dto.getCategoriaAssociada().isEmpty()) {
            meta.setCategoriaAssociada(dto.getCategoriaAssociada());
        } else {
            meta.setCategoriaAssociada(null);
        }
        // --- FIM DA LÓGICA ---

        return metaRepository.save(meta);
    }

    public void deleteMeta(Long id) {
        if (!metaRepository.existsById(id)) {
            throw new EntityNotFoundException("Meta não encontrada");
        }
        metaRepository.deleteById(id);
    }
    
    // Método auxiliar para converter Model em DTO
    private MetaResponseDTO mapToMetaResponseDTO(Meta meta) {
        UserResponseDTO userDTO = new UserResponseDTO(
            meta.getUser().getId(),
            meta.getUser().getUsername(),
            meta.getUser().getEmail()
        );

        // Assumindo que MetaResponseDTO também tem o campo 'categoriaAssociada'
        // Se não tiver, você pode adicionar. Por agora, vou usar o construtor que conheço.
        // (Seu MetaResponseDTO não está 100% visível na minha memória, mas isto deve funcionar)
        MetaResponseDTO dto = new MetaResponseDTO();
        dto.setId(meta.getId());
        dto.setDescription(meta.getDescription());
        dto.setTargetAmount(meta.getTargetAmount());
        dto.setCurrentAmount(meta.getCurrentAmount());
        dto.setCategory(meta.getCategory());
        dto.setDeadline(meta.getDeadline());
        dto.setUser(userDTO);
        // dto.setCategoriaAssociada(meta.getCategoriaAssociada()); // Adicione se o DTO de resposta tiver

        return dto;
    }
}