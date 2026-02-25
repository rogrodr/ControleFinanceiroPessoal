package com.webbolso.backend.service;

import com.webbolso.backend.dto.UserLoginDTO;
import com.webbolso.backend.dto.UserRegisterDTO;
import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserRegisterDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        
        // ============================================
        // CÓDIGO DE ROLES REMOVIDO
        // Não é mais necessário definir roles no registro
        // ============================================
        
        return userRepository.save(user);
    }

    public boolean authenticateUser(UserLoginDTO dto) {
        return userRepository.findByUsername(dto.getUsername())
                .map(user -> passwordEncoder.matches(dto.getPassword(), user.getPassword()))
                .orElse(false);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
}