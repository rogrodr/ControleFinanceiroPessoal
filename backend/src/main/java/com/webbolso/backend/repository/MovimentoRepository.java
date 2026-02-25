package com.webbolso.backend.repository;

import com.webbolso.backend.model.Movimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovimentoRepository extends JpaRepository<Movimento, Long> {

    List<Movimento> findByUserId(Long userId);

    // --- REMOVA ESTA LINHA ---
    // List<Movimento> findByUserIdAndCategoriaAssociada(Long userId, String categoriaAssociada);
    // --- FIM DA REMOÇÃO ---

    @Query("SELECT SUM(m.valor) FROM Movimento m WHERE m.user.id = :userId AND m.tipo = 'DESPESA'")
    Double findTotalDespesasByUserId(@Param("userId") Long userId); // Verifique se esta query ainda é usada/necessária

    List<Movimento> findByEmprestimoId(Long emprestimoId); // Para desassociar ao deletar empréstimo

}