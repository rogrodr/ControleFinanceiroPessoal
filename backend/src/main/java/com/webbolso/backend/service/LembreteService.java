package com.webbolso.backend.service;

import com.webbolso.backend.dto.LembreteDTO;
import com.webbolso.backend.dto.LembreteResponseDTO;
import com.webbolso.backend.dto.UserResponseDTO;
import com.webbolso.backend.model.Lembrete;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.LembreteRepository;
import com.webbolso.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LembreteService {

    @Autowired private LembreteRepository lembreteRepository;
    @Autowired private UserRepository userRepository;

    private Lembrete findLembreteByIdAndUserId(Long id, Long userId) { /* ... (como antes) ... */ return null; }
     private Lembrete findLembreteByIdAndUserIdImpl(Long id, Long userId) { Lembrete l = lembreteRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Lembrete "+id+" not found")); if (l.getUser()==null || !l.getUser().getId().equals(userId)) throw new SecurityException("Access denied to lembrete "+id); return l; }


    @Transactional
    public Lembrete createLembrete(Long userId, LembreteDTO dto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        Lembrete lembrete = new Lembrete();
        lembrete.setUser(user);
        lembrete.setDescription(dto.getDescription());
        lembrete.setDueDate(dto.getDueDate());
        lembrete.setCategory(dto.getCategory());
        lembrete.setStatus("PENDENTE");

        // --- CORREÇÃO: Usar movimentoId ---
        lembrete.setMovimentoId(dto.getMovimentoId()); // << ALTERADO
        // --- FIM CORREÇÃO ---

        return lembreteRepository.save(lembrete);
    }

    public List<LembreteResponseDTO> getUserLembretes(Long userId) {
        if (!userRepository.existsById(userId)) { throw new EntityNotFoundException("Usuário " + userId + " não encontrado"); }
        return lembreteRepository.findByUserId(userId).stream()
                .map(this::mapToLembreteResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LembreteResponseDTO updateLembrete(Long id, LembreteDTO dto, Long userId) {
        Lembrete lembrete = findLembreteByIdAndUserIdImpl(id, userId); // Usando Impl
        lembrete.setDescription(dto.getDescription());
        lembrete.setDueDate(dto.getDueDate());
        lembrete.setCategory(dto.getCategory());

        // --- CORREÇÃO: Usar movimentoId ---
        lembrete.setMovimentoId(dto.getMovimentoId()); // << ALTERADO
        // --- FIM CORREÇÃO ---
        // Status não é atualizado aqui

        Lembrete updatedLembrete = lembreteRepository.save(lembrete);
        return mapToLembreteResponseDTO(updatedLembrete);
    }

    @Transactional
    public void deleteLembrete(Long id, Long userId) {
        Lembrete lembrete = findLembreteByIdAndUserIdImpl(id, userId); // Usando Impl
        lembreteRepository.delete(lembrete);
    }

    @Transactional
    public LembreteResponseDTO marcarComoConcluido(Long id, Long userId) {
        Lembrete lembrete = findLembreteByIdAndUserIdImpl(id, userId); // Usando Impl
        lembrete.setStatus("CONCLUIDO");
        Lembrete updatedLembrete = lembreteRepository.save(lembrete);
        System.out.println("Lembrete ID " + id + " marcado como CONCLUIDO");
        return mapToLembreteResponseDTO(updatedLembrete);
    }


    private LembreteResponseDTO mapToLembreteResponseDTO(Lembrete lembrete) {
        if (lembrete == null) return null;
        UserResponseDTO userDTO = null;
        if (lembrete.getUser() != null) {
            userDTO = new UserResponseDTO(lembrete.getUser().getId(), lembrete.getUser().getUsername(), lembrete.getUser().getEmail());
        }
        LembreteResponseDTO dto = new LembreteResponseDTO();
        dto.setId(lembrete.getId());
        dto.setDescription(lembrete.getDescription());
        dto.setDueDate(lembrete.getDueDate());
        dto.setCategory(lembrete.getCategory());
        dto.setUser(userDTO);
        dto.setStatus(lembrete.getStatus());

        // --- CORREÇÃO: Mapear movimentoId ---
        dto.setMovimentoId(lembrete.getMovimentoId()); // << ALTERADO
        // --- FIM CORREÇÃO ---

        return dto;
    }
}