package com.homeease.auth.service;

import com.homeease.auth.dto.AuthDtos.*;

import com.homeease.auth.entity.User;
import com.homeease.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homeease.auth.dto.AuthDtos.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse findById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateUserRequest req) {
        ensureSelfOrAdmin(id);
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

     
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }
        if (req.getImageUrl() != null) {
            user.setImageUrl(req.getImageUrl());
        }
      
        return toResponse(user);
    }

    @Transactional
    public void changePassword(Long id, ChangePasswordRequest req) {
        ensureSelf(id);   
        User user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
    }

    
    private void ensureSelfOrAdmin(Long targetId) {
        Long currentId = currentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!currentId.equals(targetId) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only modify your own profile");
        }
    }

    
    private void ensureSelf(Long targetId) {
        if (!currentUserId().equals(targetId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only change your own password");
        }
    }

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .imageUrl(user.getImageUrl())
                .build();
    }
    
    public PagedResponse<UserResponse> findAll(int page,
            int size,
            User.Role role) {

PageRequest pageable =
PageRequest.of(page,
size,
Sort.by("id").descending());

Page<User> result = (role == null)
? userRepo.findAll(pageable)
: userRepo.findByRole(role, pageable);

return PagedResponse.<UserResponse>builder()
.content(result.getContent()
.stream()
.map(this::toResponse)
.toList())
.page(result.getNumber())
.size(result.getSize())
.totalElements(result.getTotalElements())
.totalPages(result.getTotalPages())
.build();
}
    
    
}