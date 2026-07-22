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

    @PostMapping("/register")
    public ResponseEntity<Resp<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req) {

        return ResponseEntity.ok(
                Resp.success(authService.register(req))
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
}