package com.ddu.paperhub.service;

import com.ddu.paperhub.dto.AuthRequest;
import com.ddu.paperhub.dto.AuthResponse;
import com.ddu.paperhub.dto.RegisterRequest;
import com.ddu.paperhub.entity.Role;
import com.ddu.paperhub.entity.User;
import com.ddu.paperhub.exception.BadRequestException;
import com.ddu.paperhub.repository.UserRepository;
import com.ddu.paperhub.security.JwtTokenProvider;
import com.ddu.paperhub.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_STUDENT) // Default role as specified
                .enabled(true)
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: id={}, email={}, role={}", user.getId(), user.getEmail(), user.getRole());

        String token = tokenProvider.generateTokenForUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        log.info("User logged in successfully: email={}, role={}", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
