package com.homeease.auth.service;

import com.homeease.auth.dto.AuthDtos.*;
import com.homeease.auth.entity.Provider;
import com.homeease.auth.entity.User;
import com.homeease.auth.repository.ProviderRepository;
import com.homeease.auth.repository.UserRepository;
import com.homeease.auth.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final OtpService otpService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo,
                       ProviderRepository providerRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       OtpService otpService,
                       EmailService emailService) {
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    /**
     * Registration is a two step flow now. This step validates and emails a code
     * but writes nothing; the account is created by verifyOtp. No transaction is
     * needed because there is no write to roll back.
     */
    public OtpSentResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        // Checked here as well as at verify time so that a provider with no
        // category fails before an email is ever sent.
        if (req.getRole() == User.Role.PROVIDER && req.getCategoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provider registration requires categoryId");
        }

        PendingRegistration pending = PendingRegistration.builder()
                .name(req.getName())
                .email(req.getEmail())
                .encodedPassword(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .phone(req.getPhone())
                .categoryId(req.getCategoryId())
                .experience(req.getExperience())
                .build();

        String code = otpService.generateAndStore(req.getEmail(), pending);
        emailService.sendOtpEmail(req.getEmail(), code);

        return OtpSentResponse.builder()
                .message("OTP sent to your email")
                .email(req.getEmail())
                .build();
    }

    /**
     * Consumes the OTP and only then creates the account. Returns the same shape
     * as login so the client can treat it as a completed sign in.
     */
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest req) {

        PendingRegistration pending = otpService.verify(req.getEmail(), req.getCode());

        // The uniqueness check from register is up to ten minutes stale by now.
        if (userRepo.existsByEmail(pending.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (pending.getRole() == User.Role.PROVIDER && pending.getCategoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provider registration requires categoryId");
        }

        User user = User.builder()
                .name(pending.getName())
                .email(pending.getEmail())
                .password(pending.getEncodedPassword())
                .role(pending.getRole())
                .phone(pending.getPhone())
                .emailVerified(true)
                .build();
        user = userRepo.save(user);

        if (pending.getRole() == User.Role.PROVIDER) {
            Provider provider = Provider.builder()
                    .user(user)
                    .categoryId(pending.getCategoryId())
                    .experience(pending.getExperience() == null ? 0 : pending.getExperience())
                    .availability(true)
                    .isApproved(false)
                    .build();
            providerRepo.save(provider);
        }

        return buildAuthResponse(user);
    }

    public OtpSentResponse resendOtp(ResendOtpRequest req) {
        String code = otpService.resend(req.getEmail());
        emailService.sendOtpEmail(req.getEmail(), code);

        return OtpSentResponse.builder()
                .message("OTP resent")
                .email(req.getEmail())
                .build();
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
    
    public UserResponse me() {

        Long userId = (Long) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .imageUrl(user.getImageUrl())
                .build();
    }
}
