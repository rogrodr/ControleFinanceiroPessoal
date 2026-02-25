package com.webbolso.backend.repository;

import com.webbolso.backend.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MetaRepository extends JpaRepository<Meta, Long> {

    List<Meta> findByUserId(Long userId);

    // --- GARANTA QUE ESTA LINHA EXISTA AQUI ---
    List<Meta> findByUserIdAndCategoriaAssociada(Long userId, String categoriaAssociada);
    // --- FIM DA VERIFICAÇÃO ---
}