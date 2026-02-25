package com.webbolso.backend.service;

import com.webbolso.backend.dto.MovimentoDTO;
import com.webbolso.backend.dto.MovimentoResponseDTO;
import com.webbolso.backend.dto.UserResponseDTO;
import com.webbolso.backend.model.EmprestimoFinanciamento;
import com.webbolso.backend.model.Meta;
import com.webbolso.backend.model.Movimento;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.EmprestimoFinanciamentoRepository;
import com.webbolso.backend.repository.MetaRepository;
import com.webbolso.backend.repository.MovimentoRepository;
import com.webbolso.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class MovimentoService {

    @Autowired private MovimentoRepository movimentoRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MetaRepository metaRepository;
    @Autowired private EmprestimoFinanciamentoRepository emprestimoRepository;

    // --- Helper method to find and verify ownership ---
    private Movimento findMovimentoByIdAndUserId(Long id, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + userId));

        Movimento movimento = movimentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimento não encontrado com ID: " + id));

        if (movimento.getUser() == null || !movimento.getUser().getId().equals(userId)) {
            throw new SecurityException("Acesso negado ao movimento ID: " + id);
        }
        return movimento;
    }

    @Transactional
    public List<Movimento> createMovimento(Long userId, MovimentoDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + userId));
        
        if (dto.getValor() == null || dto.getValor() <= 0) throw new IllegalArgumentException("Valor inválido.");
        if (dto.getDescription() == null || dto.getDescription().trim().isEmpty()) throw new IllegalArgumentException("Descrição vazia.");

        List<Movimento> movimentosGerados = new ArrayList<>();
        int totalParcelas = (dto.getTotalParcelas() != null && dto.getTotalParcelas() > 0) ? dto.getTotalParcelas() : 1;
        int parcelaAtualBase = (dto.getParcelaAtual() != null && dto.getParcelaAtual() > 0) ? dto.getParcelaAtual() : 1;

        for (int i = 0; i < totalParcelas; i++) {
            Movimento movimento = new Movimento();
            movimento.setUser(user);
            movimento.setDescription(dto.getDescription());
            movimento.setValor(dto.getValor());
            movimento.setCategory(dto.getCategory());
            movimento.setDate(dto.getDate().plusMonths(i));
            movimento.setTipo(dto.getTipo().toUpperCase());
            movimento.setStatusPagamento(dto.getStatusPagamento().toUpperCase());
            movimento.setTotalParcelas(totalParcelas);
            movimento.setParcelaAtual(parcelaAtualBase + i);

            Movimento movimentoSalvo = movimentoRepository.save(movimento);
            movimentosGerados.add(movimentoSalvo);

            if ("RECEITA".equalsIgnoreCase(movimento.getTipo()) && "RECEBIDO".equalsIgnoreCase(movimento.getStatusPagamento())) {
                atualizarMetasPorCategoria(userId, movimento.getCategory(), movimento.getValor());
            }
        }
        return movimentosGerados;
    }

    public List<MovimentoResponseDTO> getUserMovimentos(Long userId) {
        if (!userRepository.existsById(userId)) {
             throw new EntityNotFoundException("Usuário não encontrado com ID: " + userId);
        }
        return movimentoRepository.findByUserId(userId).stream()
                .map(this::mapToMovimentoResponseDTO)
                .collect(Collectors.toList());
    }

    public MovimentoResponseDTO getMovimentoByIdAndUserId(Long id, Long userId) {
         Movimento movimento = findMovimentoByIdAndUserId(id, userId);
         return mapToMovimentoResponseDTO(movimento);
    }

    @Transactional
    public MovimentoResponseDTO updateMovimento(Long id, MovimentoDTO dto, Long userId) {
        Movimento movimento = findMovimentoByIdAndUserId(id, userId);
        String statusAntigo = movimento.getStatusPagamento();
        String categoriaAntiga = movimento.getCategory();
        String tipoAntigo = movimento.getTipo();

        movimento.setDescription(dto.getDescription());
        movimento.setValor(dto.getValor());
        movimento.setCategory(dto.getCategory());
        movimento.setDate(dto.getDate());
        movimento.setTipo(dto.getTipo().toUpperCase());
        movimento.setStatusPagamento(dto.getStatusPagamento().toUpperCase());
        movimento.setTotalParcelas(dto.getTotalParcelas());
        movimento.setParcelaAtual(dto.getParcelaAtual());

        Movimento movimentoAtualizado = movimentoRepository.save(movimento);

        // Verifica se mudou algo relevante para metas
        boolean statusMudou = !statusAntigo.equalsIgnoreCase(movimentoAtualizado.getStatusPagamento());
        boolean categoriaMudou = !categoriaAntiga.equalsIgnoreCase(movimentoAtualizado.getCategory());
        boolean tipoMudou = !tipoAntigo.equalsIgnoreCase(movimentoAtualizado.getTipo());

        if (statusMudou || categoriaMudou || tipoMudou) {
             handleStatusChangeSideEffects(movimentoAtualizado, statusAntigo);
        }

        return mapToMovimentoResponseDTO(movimentoAtualizado);
    }

    @Transactional
    public void deleteMovimento(Long id, Long userId) {
        Movimento movimento = findMovimentoByIdAndUserId(id, userId);
        movimentoRepository.delete(movimento);
    }

    @Transactional
    public MovimentoResponseDTO pagarReceberMovimento(Long id, String novoStatus, Long userId) {
        Movimento movimento = findMovimentoByIdAndUserId(id, userId);
        String statusAntigo = movimento.getStatusPagamento();
        String novoStatusUpper = novoStatus.toUpperCase();

        if (!statusAntigo.equalsIgnoreCase(novoStatusUpper)) {
            movimento.setStatusPagamento(novoStatusUpper);
            Movimento movimentoAtualizado = movimentoRepository.save(movimento);
            handleStatusChangeSideEffects(movimentoAtualizado, statusAntigo);
            return mapToMovimentoResponseDTO(movimentoAtualizado);
        } else {
            return mapToMovimentoResponseDTO(movimento);
        }
    }

    // --- LÓGICA DE EFEITOS COLATERAIS ---
    private void handleStatusChangeSideEffects(Movimento movimento, String statusAntigo) {
        String statusNovo = movimento.getStatusPagamento();
        Long userId = movimento.getUser().getId();

        // CORREÇÃO: Verifica se é RECEITA + RECEBIDO e se o status mudou para RECEBIDO
        if ("RECEITA".equalsIgnoreCase(movimento.getTipo()) && 
            "RECEBIDO".equalsIgnoreCase(statusNovo) && 
            !"RECEBIDO".equalsIgnoreCase(statusAntigo)) {
            
            System.out.println("DEBUG: Movimento RECEITA recebido. Categoria: " + movimento.getCategory() + ", Valor: " + movimento.getValor());
            atualizarMetasPorCategoria(userId, movimento.getCategory(), movimento.getValor());
        }
        
        // Empréstimos
        if ("DESPESA".equalsIgnoreCase(movimento.getTipo()) && 
            "PAGO".equalsIgnoreCase(statusNovo) && 
            !"PAGO".equalsIgnoreCase(statusAntigo) && 
            movimento.getEmprestimoId() != null) {
            atualizarSaldoEmprestimo(movimento);
        }
    }

    private void atualizarSaldoEmprestimo(Movimento parcelaPaga) {
        Long emprestimoId = parcelaPaga.getEmprestimoId();
        if (parcelaPaga.getValorAmortizacao() == null || parcelaPaga.getValorAmortizacao() <= 0) {
             System.err.println("AVISO: Movimento ID " + parcelaPaga.getId() + " pago sem amortização válida. Saldo empréstimo NÃO atualizado.");
             return;
        }
        Optional<EmprestimoFinanciamento> optionalEmprestimo = emprestimoRepository.findById(emprestimoId);
        if (optionalEmprestimo.isPresent()) {
            EmprestimoFinanciamento emprestimo = optionalEmprestimo.get();
            BigDecimal saldoAtual = BigDecimal.valueOf(emprestimo.getSaldoDevedor());
            BigDecimal amortizacao = BigDecimal.valueOf(parcelaPaga.getValorAmortizacao());
            BigDecimal novoSaldo = saldoAtual.subtract(amortizacao);
            emprestimo.setSaldoDevedor(novoSaldo.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP).doubleValue());
            emprestimo.setParcelasPagas(emprestimo.getParcelasPagas() + 1);
            if (emprestimo.getParcelasPagas() >= emprestimo.getTotalParcelas()) {
                emprestimo.setStatus("QUITADO");
                emprestimo.setSaldoDevedor(0.0);
            }
            emprestimoRepository.save(emprestimo);
            System.out.println("Empréstimo ID " + emprestimoId + " atualizado via amortização. Novo saldo: " + emprestimo.getSaldoDevedor());
        } else {
            System.err.println("ERRO CRÍTICO: Empréstimo ID " + emprestimoId + " não encontrado para Movimento ID " + parcelaPaga.getId() + "!");
        }
    }

    // --- CORREÇÃO PRINCIPAL: Busca case-insensitive ---
    private void atualizarMetasPorCategoria(Long userId, String categoria, Double valor) {
        if (categoria == null || categoria.trim().isEmpty() || valor == null || valor <= 0) {
            System.out.println("DEBUG: Categoria ou valor inválido. Categoria: " + categoria + ", Valor: " + valor);
            return;
        }
        
        // Busca TODAS as metas do usuário
        List<Meta> todasMetas = metaRepository.findByUserId(userId);
        
        // Filtra as que têm categoriaAssociada correspondente (case-insensitive)
        List<Meta> metas = todasMetas.stream()
            .filter(meta -> meta.getCategoriaAssociada() != null && 
                           meta.getCategoriaAssociada().trim().equalsIgnoreCase(categoria.trim()))
            .collect(Collectors.toList());
        
        if (metas.isEmpty()) {
            System.out.println("DEBUG: Nenhuma meta encontrada com categoriaAssociada = '" + categoria + "' para userId " + userId);
            System.out.println("DEBUG: Metas do usuário: " + todasMetas.stream()
                .map(m -> m.getDescription() + " (catAssoc: " + m.getCategoriaAssociada() + ")")
                .collect(Collectors.joining(", ")));
            return;
        }
        
        System.out.println("Automação Meta: Atualizando " + metas.size() + " meta(s) para categoria '" + categoria + "' com valor " + valor);
        
        for (Meta meta : metas) {
            BigDecimal current = BigDecimal.valueOf(meta.getCurrentAmount());
            BigDecimal toAdd = BigDecimal.valueOf(valor);
            BigDecimal newAmount = current.add(toAdd);
            meta.setCurrentAmount(newAmount.doubleValue());
            metaRepository.save(meta);
            System.out.println("  - Meta '" + meta.getDescription() + "' atualizada: " + current + " -> " + newAmount);
        }
    }

    // --- MÉTODOS DE ANÁLISE ---
    private Stream<Movimento> getMovimentosStream(Long userId, String tipo) {
        return movimentoRepository.findByUserId(userId).stream()
            .filter(m -> tipo == null || tipo.equalsIgnoreCase(m.getTipo()));
    }
    
    public Double getTotalValor(Long userId, String tipo) {
        return getMovimentosStream(userId, tipo).mapToDouble(Movimento::getValor).sum();
    }
    
    public Map<String, Double> getDespesasPorCategoria(Long userId, String tipo) {
        String t = (tipo != null && !tipo.isEmpty()) ? tipo.toUpperCase() : "DESPESA";
        return getMovimentosStream(userId, t)
            .filter(m -> m.getCategory() != null)
            .collect(Collectors.groupingBy(Movimento::getCategory, Collectors.summingDouble(Movimento::getValor)));
    }
    
    public Map<Month, Double> getResumoMensal(Long userId, int year, String tipo) {
        String t = (tipo != null && !tipo.isEmpty()) ? tipo.toUpperCase() : null;
        return getMovimentosStream(userId, t)
            .filter(m -> m.getDate() != null && m.getDate().getYear() == year)
            .collect(Collectors.groupingBy(m -> m.getDate().getMonth(), Collectors.summingDouble(Movimento::getValor)));
    }
    
    public Map<String, Double> getMovimentosPorPeriodo(Long userId, String periodo) {
        LocalDate now = LocalDate.now();
        LocalDate start;
        switch (periodo.toLowerCase()) {
            case "semana": start = now.minusDays(now.getDayOfWeek().getValue() - 1); break;
            case "mes": start = now.with(TemporalAdjusters.firstDayOfMonth()); break;
            case "ano": start = now.with(TemporalAdjusters.firstDayOfYear()); break;
            default: throw new IllegalArgumentException("Período inválido: " + periodo);
        }
        return getMovimentosStream(userId, null)
            .filter(m -> m.getDate() != null && !m.getDate().isBefore(start))
            .filter(m -> m.getCategory() != null)
            .collect(Collectors.groupingBy(Movimento::getCategory, Collectors.summingDouble(Movimento::getValor)));
    }

    // --- MAPEAMENTO DTO ---
    private MovimentoResponseDTO mapToMovimentoResponseDTO(Movimento movimento) {
        if (movimento == null) return null;
        UserResponseDTO userDTO = null;
        if (movimento.getUser() != null) {
            userDTO = new UserResponseDTO(
                movimento.getUser().getId(),
                movimento.getUser().getUsername(),
                movimento.getUser().getEmail()
            );
        }
        MovimentoResponseDTO dto = new MovimentoResponseDTO();
        dto.setId(movimento.getId());
        dto.setDescription(movimento.getDescription());
        dto.setValor(movimento.getValor());
        dto.setCategory(movimento.getCategory());
        dto.setDate(movimento.getDate());
        dto.setTipo(movimento.getTipo());
        dto.setStatusPagamento(movimento.getStatusPagamento());
        dto.setTotalParcelas(movimento.getTotalParcelas());
        dto.setParcelaAtual(movimento.getParcelaAtual());
        dto.setUser(userDTO);
        return dto;
    }
}