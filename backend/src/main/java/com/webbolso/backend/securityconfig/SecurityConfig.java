package com.webbolso.backend.securityconfig;

import com.webbolso.backend.model.User;
import com.webbolso.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.stream.Collectors;
// NOVAS IMPORTAÇÕES NECESSÁRIAS PARA CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

// IMPORTAÇÕES ADICIONADAS PARA O JWT AUTHENTICATION CONVERTER
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
// Removido: import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Collection;
import java.util.Collections;
import org.springframework.core.convert.converter.Converter; // Importar a interface Converter


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests((requests) -> requests
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/metas/**").hasRole("USER")
                .requestMatchers("/api/orcamentos/**").hasRole("USER")
                .requestMatchers("/api/lembretes/**").hasRole("USER")
                .requestMatchers("/api/despesas/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder(keyPair()))
                    // ADICIONANDO O CONVERSOR DE AUTHORITIES DO JWT
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .logout(logout -> logout.permitAll());
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permita a origem do seu frontend
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // AQUI ONDE SEU FRONTEND RODA
        // Permita todos os métodos HTTP (GET, POST, PUT, DELETE, OPTIONS, etc.)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Permita todos os cabeçalhos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Permita o envio de cookies e credenciais (ex: cabeçalhos de autenticação)
        configuration.setAllowCredentials(true);
        // Defina o tempo de vida máximo para as informações de preflight (em segundos)
        configuration.setMaxAge(3600L); // 1 hora
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica esta configuração a todos os caminhos
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            System.out.println("Tentando carregar usuário: " + username); // Debugging
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        System.out.println("Usuário NÃO encontrado: " + username); // Debugging
                        return new UsernameNotFoundException("Usuário não encontrado: " + username);
                    });
            System.out.println("Usuário ENCONTRADO: " + user.getUsername() + " com roles: " + user.getRoles()); // Debugging
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password(user.getPassword())
                    .authorities(user.getRoles().stream()
                            // As roles já vêm com "ROLE_" do UserService, então SimpleGrantedAuthority::new está correto.
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()))
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public KeyPair keyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate key pair", e);
        }
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(KeyPair keyPair) {
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID("webbolso-key-id")
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtDecoder jwtDecoder(KeyPair keyPair) {
        return NimbusJwtDecoder.withPublicKey((RSAPublicKey) keyPair.getPublic()).build();
    }

    // NOVO BEAN: CONVERSOR DE AUTHORITIES PERSONALIZADO PARA O JWT
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new Converter<Jwt, Collection<GrantedAuthority>>() {
            @Override
            public Collection<GrantedAuthority> convert(Jwt jwt) {
                String rolesString = jwt.getClaimAsString("roles"); // Pega o claim "roles"
                if (rolesString == null || rolesString.isEmpty()) {
                    return Collections.emptyList();
                }
                // Divide a string por espaços e converte cada role para SimpleGrantedAuthority
                return Arrays.stream(rolesString.split(" "))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }
        });
        return converter;
    }
}