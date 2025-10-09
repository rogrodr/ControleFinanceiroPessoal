
package com.webbolso.backend.repository;

import com.webbolso.backend.model.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByUserId(Long userId);
}