package com.webbolso.backend.service;

import com.webbolso.backend.dto.EmprestimoFinanciamentoDTO;
import com.webbolso.backend.model.EmprestimoFinanciamento;
import com.webbolso.backend.model.Movimento; // Import Movimento
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.EmprestimoFinanciamentoRepository;
import com.webbolso.backend.repository.MovimentoRepository;
import com.webbolso.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmprestimoFinanciamentoService {

    @Autowired private EmprestimoFinanciamentoRepository emprestimoRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MovimentoRepository movimentoRepository; // Injetado

    // --- Helper method to find and verify ownership ---
    private EmprestimoFinanciamento findEmprestimoByIdAndUserId(Long id, Long userId) {
        // Verifica se o usuário existe (boa prática)
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + userId));

        EmprestimoFinanciamento emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empréstimo/Financiamento não encontrado com ID: " + id));

        // Verifica se o empréstimo pertence ao usuário
        if (emprestimo.getUser() == null || !emprestimo.getUser().getId().equals(userId)) {
            throw new SecurityException("Acesso negado ao Empréstimo/Financiamento ID: " + id);
            // Ou: throw new EntityNotFoundException("Empréstimo/Financiamento não encontrado com ID: " + id);
        }
        return emprestimo;
    }
    // --- End Helper Method ---

    @Transactional
    public EmprestimoFinanciamento createEmprestimoFinanciamento(Long userId, EmprestimoFinanciamentoDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + userId));

        EmprestimoFinanciamento emprestimo = new EmprestimoFinanciamento();
        emprestimo.setUser(user);
        emprestimo.setDescription(dto.getDescription());
        emprestimo.setValorTotal(dto.getValorTotal());
        emprestimo.setSaldoDevedor(dto.getValorTotal());
        emprestimo.setDataContratacao(dto.getDataContratacao());
        emprestimo.setTotalParcelas(dto.getTotalParcelas());
        emprestimo.setParcelasPagas(0);
        emprestimo.setStatus("ATIVO");
        emprestimo.setCategoria(dto.getCategoria());
        double taxaDecimal = dto.getTaxaJurosMensal() / 100.0;
        emprestimo.setTaxaJurosMensal(taxaDecimal);

        EmprestimoFinanciamento savedEmprestimo = emprestimoRepository.save(emprestimo);

        // --- Calcular Amortização e Criar Parcelas ---
        List<Movimento> parcelas = new ArrayList<>();
        BigDecimal saldoDevedorAtual = BigDecimal.valueOf(dto.getValorTotal());
        BigDecimal valorParcelaFixa = BigDecimal.valueOf(dto.getValorParcela());
        BigDecimal taxaJuros = BigDecimal.valueOf(taxaDecimal);
        int scale = 2;
        RoundingMode roundingMode = RoundingMode.HALF_UP;

        for (int i = 0; i < dto.getTotalParcelas(); i++) {
            BigDecimal jurosDaParcela = saldoDevedorAtual.multiply(taxaJuros).setScale(scale, roundingMode);
            BigDecimal amortizacaoDaParcela = valorParcelaFixa.subtract(jurosDaParcela).setScale(scale, roundingMode);

            // Ajuste na última parcela
            if (i == dto.getTotalParcelas() - 1 && saldoDevedorAtual.compareTo(amortizacaoDaParcela) != 0) {
                 System.out.println("Ajustando última amortização de " + amortizacaoDaParcela + " para " + saldoDevedorAtual);
                 amortizacaoDaParcela = saldoDevedorAtual; // Última amortização é o saldo restante
                 // Recalcula juros com base na última amortização se necessário (opcional)
                 // jurosDaParcela = valorParcelaFixa.subtract(amortizacaoDaParcela).setScale(scale, roundingMode);
                 // Se recalcular juros, pode ser necessário ajustar o valor total da última parcela para bater
            }
             // Garante que a amortização não seja negativa se os juros forem maiores que a parcela (erro nos dados de entrada)
            if (amortizacaoDaParcela.compareTo(BigDecimal.ZERO) < 0) {
                 System.err.println("Alerta: Amortização calculada negativa na parcela " + (i+1) + ". Verifique taxa de juros e valor da parcela.");
                 amortizacaoDaParcela = BigDecimal.ZERO; // Ou lançar erro
             }


            Movimento parcela = new Movimento();
            parcela.setUser(user);
            parcela.setDescription(dto.getDescription() + " (Parcela " + (i + 1) + "/" + dto.getTotalParcelas() + ")");
            parcela.setValor(valorParcelaFixa.doubleValue());
            parcela.setCategory(dto.getCategoria());
            parcela.setDate(dto.getDataPrimeiraParcela().plusMonths(i));
            parcela.setTipo("DESPESA");
            parcela.setStatusPagamento("A PAGAR");
            parcela.setTotalParcelas(dto.getTotalParcelas());
            parcela.setParcelaAtual(i + 1);
            parcela.setEmprestimoId(savedEmprestimo.getId());
            parcela.setValorAmortizacao(amortizacaoDaParcela.doubleValue());

            parcelas.add(parcela);
            saldoDevedorAtual = saldoDevedorAtual.subtract(amortizacaoDaParcela);
             // Log para debug
             // System.out.println("Parcela " + (i+1) + ": Juros=" + jurosDaParcela + ", Amort=" + amortizacaoDaParcela + ", Saldo Rem.=" + saldoDevedorAtual);

        }
        movimentoRepository.saveAll(parcelas);
        return savedEmprestimo;
    }

    public List<EmprestimoFinanciamento> getUserEmprestimos(Long userId) {
        if (!userRepository.existsById(userId)) {
             throw new EntityNotFoundException("Usuário não encontrado com ID: " + userId);
        }
        return emprestimoRepository.findByUserId(userId);
    }

    // --- Método getEmprestimoByIdAndUserId ADICIONADO ---
     public EmprestimoFinanciamento getEmprestimoByIdAndUserId(Long id, Long userId) {
         // Reutiliza o helper method que já faz a busca e a verificação
         return findEmprestimoByIdAndUserId(id, userId);
     }
    // --- FIM ---

    // --- Método updateEmprestimo com userId ---
    @Transactional
    public EmprestimoFinanciamento updateEmprestimo(Long id, EmprestimoFinanciamentoDTO dto, Long userId) {
        EmprestimoFinanciamento emprestimo = findEmprestimoByIdAndUserId(id, userId); // Busca e verifica

        // Lógica de restrição (não permite alterar campos financeiros críticos)
        boolean criticalChange = !emprestimo.getValorTotal().equals(dto.getValorTotal()) ||
                                 Math.abs(emprestimo.getTaxaJurosMensal() - (dto.getTaxaJurosMensal() / 100.0)) > 0.0001 ||
                                 !emprestimo.getTotalParcelas().equals(dto.getTotalParcelas());
        if (criticalChange && "ATIVO".equals(emprestimo.getStatus())) {
             throw new UnsupportedOperationException("Não é permitido alterar valor, taxa ou número de parcelas de um empréstimo ativo.");
        }

        // Atualiza apenas campos descritivos
        emprestimo.setDescription(dto.getDescription());
        emprestimo.setCategoria(dto.getCategoria());

        return emprestimoRepository.save(emprestimo);
    }
    // --- FIM ---

    // --- Método deleteEmprestimo com userId ---
    @Transactional
    public void deleteEmprestimo(Long id, Long userId) {
        EmprestimoFinanciamento emprestimo = findEmprestimoByIdAndUserId(id, userId); // Busca e verifica

        // Desassocia Movimentos (parcelas)
        // **IMPORTANTE: Certifique-se que o método findByEmprestimoId existe no MovimentoRepository**
        List<Movimento> parcelas = movimentoRepository.findByEmprestimoId(id);
        if (parcelas != null) { // Verifica se a lista não é nula
            for (Movimento parcela : parcelas) {
                parcela.setEmprestimoId(null);
                movimentoRepository.save(parcela);
            }
        } else {
             System.out.println("Nenhuma parcela encontrada para desassociar do empréstimo ID: " + id);
        }


        // Deleta o Empréstimo
        emprestimoRepository.delete(emprestimo);
    }
    // --- FIM ---

    public double getTotalSaldoDevedor(Long userId) {
         if (!userRepository.existsById(userId)) {
              throw new EntityNotFoundException("Usuário não encontrado com ID: " + userId);
         }
        List<EmprestimoFinanciamento> emprestimos = emprestimoRepository.findByUserId(userId);
        BigDecimal total = BigDecimal.ZERO;
        for (EmprestimoFinanciamento emp : emprestimos) {
             // Garante que saldoDevedor não seja nulo antes de somar
            if(emp.getSaldoDevedor() != null) {
                total = total.add(BigDecimal.valueOf(emp.getSaldoDevedor()));
            }
        }
        return total.setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}