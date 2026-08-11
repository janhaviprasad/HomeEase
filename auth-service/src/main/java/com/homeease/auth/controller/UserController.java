package com.homeease.auth.controller;

import com.homeease.auth.dto.AuthDtos.*;
import com.homeease.auth.entity.User;
import com.homeease.auth.service.UserService;

import jakarta.validation.Path;
import jakarta.validation.Valid;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateProfile(id, req));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(id, req);
        return ResponseEntity.noContent().build();   // 204
    }
    
    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<UserResponse> uploadPicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws Exception {

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No file uploaded");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only image files allowed");
        }

        java.nio.file.Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        String ext = ".jpg";
        String originalName = file.getOriginalFilename();

        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String filename = "user-" + id + "-" + UUID.randomUUID() + ext;

        java.nio.file.Path target = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), target);

        UpdateUserRequest update = new UpdateUserRequest();
        update.setImageUrl("/uploads/" + filename);

        return ResponseEntity.ok(userService.updateProfile(id, update));
    }
    
    @GetMapping
    public ResponseEntity<PagedResponse<UserResponse>> findAll(
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "20")
            int size,
            @RequestParam(required = false)
            User.Role role) {
        return ResponseEntity.ok(
                userService.findAll(page, size, role)
        );
    }
    
    
}