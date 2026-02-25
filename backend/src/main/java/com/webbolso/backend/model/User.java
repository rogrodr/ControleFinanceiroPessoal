package com.webbolso.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    // ============================================
    // CAMPO 'roles' REMOVIDO - Não é mais necessário
    // O sistema usa apenas autenticação simples
    // ============================================

    // Relacionamentos com outras entidades
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Meta> metas;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Orcamento> orcamentos;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lembrete> lembretes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Movimento> contas;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmprestimoFinanciamento> emprestimosFinanciamentos;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // ============================================
    // GETTERS/SETTERS DE 'roles' REMOVIDOS
    // ============================================

    public List<Meta> getMetas() {
        return metas;
    }

    public void setMetas(List<Meta> metas) {
        this.metas = metas;
    }

    public List<Orcamento> getOrcamentos() {
        return orcamentos;
    }

    public void setOrcamentos(List<Orcamento> orcamentos) {
        this.orcamentos = orcamentos;
    }

    public List<Lembrete> getLembretes() {
        return lembretes;
    }

    public void setLembretes(List<Lembrete> lembretes) {
        this.lembretes = lembretes;
    }

    public List<Movimento> getContas() {
        return contas;
    }

    public void setContas(List<Movimento> contas) {
        this.contas = contas;
    }

    public List<EmprestimoFinanciamento> getEmprestimosFinanciamentos() {
        return emprestimosFinanciamentos;
    }

    public void setEmprestimosFinanciamentos(List<EmprestimoFinanciamento> emprestimosFinanciamentos) {
        this.emprestimosFinanciamentos = emprestimosFinanciamentos;
    }
}