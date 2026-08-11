package com.homeease.auth.controller;

import com.homeease.auth.dto.AuthDtos.*;
import com.homeease.auth.service.AuthService;
//import com.homeease.auth.controller.Resp;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Sends a verification code. The account is not created until verify-otp. */
    @PostMapping("/register")
    public ResponseEntity<Resp<OtpSentResponse>> register(
            @Valid @RequestBody RegisterRequest req) {

        return ResponseEntity.ok(
                Resp.success(authService.register(req))
        );
    }

    /** Creates the account and signs the user in. Same response shape as login. */
    @PostMapping("/verify-otp")
    public ResponseEntity<Resp<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest req) {

        return ResponseEntity.ok(
                Resp.success(authService.verifyOtp(req))
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Resp<OtpSentResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest req) {

        return ResponseEntity.ok(
                Resp.success(authService.resendOtp(req))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<Resp<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {

        return ResponseEntity.ok(
                Resp.success(authService.login(req))
        );
    }

    @GetMapping("/health")
    public ResponseEntity<Resp<String>> health() {

        return ResponseEntity.ok(
                Resp.success("Auth Service is up")
        );
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.me());
    }
}