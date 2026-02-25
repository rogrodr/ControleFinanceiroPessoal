package com.webbolso.backend.repository;

import com.webbolso.backend.model.EmprestimoFinanciamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmprestimoFinanciamentoRepository extends JpaRepository<EmprestimoFinanciamento, Long> {
    List<EmprestimoFinanciamento> findByUserId(Long userId);
}