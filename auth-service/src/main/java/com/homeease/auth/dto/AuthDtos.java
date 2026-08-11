package com.homeease.auth.dto;

import java.util.List;

import com.homeease.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


public class AuthDtos {

	  @Data
	    @Builder
	    @NoArgsConstructor
	    @AllArgsConstructor
	    public static class PagedResponse<T> {

	        private List<T> content;

	        private int page;

	        private int size;

	        private long totalElements;

	        private int totalPages;
	    }

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

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank @Email private String email;
        @NotBlank        private String code;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ResendOtpRequest {
        @NotBlank @Email private String email;
    }

    /** What register returns now: no token, no user id, nothing persisted yet. */
    @Data @AllArgsConstructor @Builder
    public static class OtpSentResponse {
        private String message;
        private String email;
    }

    /**
     * A registration held in memory until its OTP is verified. Carries everything
     * needed to create both the User and, for providers, the Provider row.
     * The password is already BCrypt-encoded; plaintext is never retained.
     */
    @Data @AllArgsConstructor @Builder
    public static class PendingRegistration {
        private String name;
        private String email;
        private String encodedPassword;
        private User.Role role;
        private String phone;
        private Long categoryId;
        private Integer experience;
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
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateUserRequest {
        private String name;
        private String phone;
        private String imageUrl;
       
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank
        private String oldPassword;
        @NotBlank @Size(min = 6)
        private String newPassword;
    }
}
