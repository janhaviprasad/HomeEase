package com.homeease.auth.service;

import com.homeease.auth.dto.AuthDtos.*;
import com.homeease.auth.entity.Provider;
import com.homeease.auth.entity.User;
import com.homeease.auth.repository.ProviderRepository;
import com.homeease.auth.repository.UserRepository;
import com.homeease.auth.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final ProviderRepository providerRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo,
                       ProviderRepository providerRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .phone(req.getPhone())
                .build();
        user = userRepo.save(user);

        // If they registered as a PROVIDER, create the matching providers row.
        // is_approved starts FALSE - admin must approve before they appear publicly.
        if (req.getRole() == User.Role.PROVIDER) {
            if (req.getCategoryId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Provider registration requires categoryId");
            }
            Provider provider = Provider.builder()
                    .user(user)
                    .categoryId(req.getCategoryId())
                    .experience(req.getExperience() == null ? 0 : req.getExperience())
                    .availability(true)
                    .isApproved(false)
                    .build();
            providerRepo.save(provider);
        }

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
        	System.out.println(""+user.getPassword());
        	System.out.println(!passwordEncoder.matches(req.getPassword(), user.getPassword()));
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user))
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
