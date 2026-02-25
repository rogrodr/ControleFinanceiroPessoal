package com.webbolso.backend.service;

import net.sf.jasperreports.engine.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.Date; // <-- 1. IMPORTADO java.sql.Date
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class JasperReportService {

    @Autowired
    private DataSource dataSource; // Conexão com o banco

    /**
     * Gera relatório PDF usando SQL direta no banco (como você fez no Jasper Studio)
     *
     * @param userId ID do usuário
     * @param dataInicio Data inicial do filtro (opcional)
     * @param dataFim Data final do filtro (opcional)
     * @param tipo Tipo de movimento: "DESPESA", "RECEITA" ou null para todos
     * @return Array de bytes do PDF gerado
     * @throws Exception
     */
    public byte[] gerarRelatorioPDF(Long userId, LocalDate dataInicio, 
                                      LocalDate dataFim, String tipo) throws Exception {
        
        // 1. Preparar parâmetros
        Map<String, Object> parametros = new HashMap<>();
        
        // IMPORTANTE: Adicionar userId como parâmetro
        parametros.put("userId", userId);
        
        // --- 2. CORREÇÃO: Converter LocalDate para java.sql.Date ---
        // O JDBC entende java.sql.Date, mas não java.time.LocalDate diretamente.
        parametros.put("dataInicio", dataInicio != null ? Date.valueOf(dataInicio) : null);
        parametros.put("dataFim", dataFim != null ? Date.valueOf(dataFim) : null);
        // -----------------------------------------------------------
        
        parametros.put("tipo", tipo);
        
        // Informações para cabeçalho (se tiver no template)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String periodoInicio = dataInicio != null ? dataInicio.format(formatter) : "Início";
        String periodoFim = dataFim != null ? dataFim.format(formatter) : "Hoje";
        parametros.put("PERIODO", periodoInicio + " a " + periodoFim);
        parametros.put("DATA_GERACAO", LocalDate.now().format(formatter));
        
        // 2. Carregar template
        File arquivo = ResourceUtils.getFile("classpath:reports/movimentoReport.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(arquivo.getAbsolutePath());
        
        // 3. Pegar conexão do banco usando try-with-resources (fecha automaticamente)
        try (Connection connection = dataSource.getConnection()) {
            
            // 4. Preencher relatório (a query SQL está dentro do .jrxml)
            JasperPrint jasperPrint = JasperFillManager.fillReport(
                jasperReport, 
                parametros, 
                connection // ← Passa a conexão!
            );
            
            // 5. Exportar para PDF
            return JasperExportManager.exportReportToPdf(jasperPrint);
            
        } 
        // 6. Não é mais necessário o bloco 'finally' para fechar a conexão
    }
}