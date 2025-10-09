package com.webbolso.backend.service;

    import com.webbolso.backend.dto.DespesaDTO;
    import com.webbolso.backend.dto.DespesaResponseDTO; // Importe o novo DTO
    import com.webbolso.backend.dto.UserResponseDTO; // Importe o novo DTO de Usuário
    import com.webbolso.backend.model.Despesa;
    import com.webbolso.backend.model.User;
    import com.webbolso.backend.repository.DespesaRepository;
    import java.time.LocalDate;
    import java.time.Month;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import java.util.List;
    import java.util.Map;
    import java.util.stream.Collectors;

    @Service
    public class DespesaService {

        @Autowired
        private DespesaRepository despesaRepository;

        @Autowired
        private UserService userService;
        
        // Método auxiliar para converter Entidade Despesa para DespesaResponseDTO
        private DespesaResponseDTO convertToDespesaResponseDTO(Despesa despesa) {
            UserResponseDTO userDto = null;
            if (despesa.getUser() != null) {
                userDto = new UserResponseDTO(despesa.getUser().getId(), despesa.getUser().getUsername(), despesa.getUser().getEmail());
            }
            return new DespesaResponseDTO(
                despesa.getId(),
                despesa.getDescription(),
                despesa.getValor(),
                despesa.getCategory(),
                despesa.getDate(),
                userDto // Passa o DTO simplificado do usuário
            );
        }

        public Map<String, Double> getDespesasPorCategoria(Long userId) {
            List<Despesa> despesas = despesaRepository.findByUserId(userId);
            return despesas.stream()
                    .collect(Collectors.groupingBy(
                                Despesa::getCategory,
                                Collectors.summingDouble(Despesa::getValor)
                    ));
        }

        public Map<Month, Double> getResumoMensal(Long userId, int year) {
            List<Despesa> despesas = despesaRepository.findByUserId(userId);
            return despesas.stream()
                    .filter(d -> d.getDate().getYear() == year)
                    .collect(Collectors.groupingBy(
                                d -> d.getDate().getMonth(),
                                Collectors.summingDouble(Despesa::getValor)
                    ));
        }

        public Map<String, Double> getDespesasPorPeriodo(Long userId, String periodo) {
            List<Despesa> despesas = despesaRepository.findByUserId(userId);
            LocalDate now = LocalDate.now();
            
            return despesas.stream()
                    .filter(d -> {
                        switch (periodo.toLowerCase()) {
                            case "semana":
                                return d.getDate().isAfter(now.minusWeeks(1));
                            case "mes":
                                return d.getDate().isAfter(now.minusMonths(1));
                            case "ano":
                                return d.getDate().isAfter(now.minusYears(1));
                            default:
                                return true;
                        }
                    })
                    .collect(Collectors.groupingBy(
                                d -> periodo.toLowerCase(),
                                Collectors.summingDouble(Despesa::getValor)
                    ));
        }

        public Despesa createDespesa(Long userId, DespesaDTO dto) {
            User user = userService.findById(userId);
            Despesa despesa = new Despesa();
            despesa.setDescription(dto.getDescription());
            despesa.setValor(dto.getValor());
            despesa.setCategory(dto.getCategory());
            despesa.setDate(dto.getDate());
            despesa.setUser(user);
            return despesaRepository.save(despesa);
        }

        // MODIFICADO: Agora retorna List<DespesaResponseDTO>
        public List<DespesaResponseDTO> getUserDespesas(Long userId) {
            List<Despesa> despesas = despesaRepository.findByUserId(userId);
            System.out.println("DespesaService: Tamanho da lista de despesas retornada pelo repositório para o userId " + userId + ": " + despesas.size());
            // Converte cada entidade Despesa para DespesaResponseDTO
            return despesas.stream()
                           .map(this::convertToDespesaResponseDTO)
                           .collect(Collectors.toList());
        }

        public Despesa updateDespesa(Long despesaId, DespesaDTO dto) {
            Despesa despesa = despesaRepository.findById(despesaId)
                    .orElseThrow(() -> new RuntimeException("Despesa não encontrada"));
            despesa.setDescription(dto.getDescription());
            despesa.setValor(dto.getValor());
            despesa.setCategory(dto.getCategory());
            despesa.setDate(dto.getDate());
            return despesaRepository.save(despesa);
        }

        public void deleteDespesa(Long despesaId) {
            despesaRepository.deleteById(despesaId);
        }

        public Double getTotalDespesas(Long userId) {
            Double total = despesaRepository.findTotalValorByUserId(userId);
            return total != null ? total : 0.0;
        }
    }