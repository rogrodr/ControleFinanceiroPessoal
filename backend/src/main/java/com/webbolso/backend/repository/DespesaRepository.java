package com.webbolso.backend.repository;

import com.webbolso.backend.model.Despesa;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    List<Despesa> findByUserId(Long userId);
    
    @Query("SELECT SUM(d.valor) FROM Despesa d WHERE d.user.id = :userId")
    Double findTotalValorByUserId(Long userId);
    
    // Novo método para buscar despesas por intervalo de datas
    @Query("SELECT d FROM Despesa d WHERE d.user.id = :userId AND d.date BETWEEN :startDate AND :endDate")
    List<Despesa> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}