package com.homeease.auth.dto;

import com.homeease.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * All the simple request and response objects, kept in one file to
 * reduce clutter. Each is a small immutable-ish data class.
 */
public class AuthDtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank @Email   private String email;
        @NotBlank          private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank                 private String name;
        @NotBlank @Email          private String email;
        @NotBlank @Size(min = 6)  private String password;
        @NotNull                  private User.Role role;
        private String phone;

        // these two are only used when role == PROVIDER, otherwise null
        private Long categoryId;
        private Integer experience;
    }

    @Data @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private String role;
    }

    @Data @AllArgsConstructor @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String phone;
        private String imageUrl;
    }

    @Data @AllArgsConstructor @Builder
    public static class ProviderResponse {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private String phone;
        private Long categoryId;
        private Integer experience;
        private Boolean availability;
        private java.math.BigDecimal rating;
        private Boolean isApproved;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RatingUpdateRequest {
        @NotNull
        private java.math.BigDecimal rating;
    }
}
