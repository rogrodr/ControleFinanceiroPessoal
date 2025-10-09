package com.webbolso.backend.repository;

import com.webbolso.backend.model.Lembrete;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LembreteRepository extends JpaRepository<Lembrete, Long> {
    List<Lembrete> findByUserId(Long userId);
}