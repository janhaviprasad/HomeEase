package com.homeease.auth.service;

import com.homeease.auth.dto.AuthDtos.ProviderResponse;
import com.homeease.auth.entity.Provider;
import com.homeease.auth.repository.ProviderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProviderService {

    private final ProviderRepository providerRepo;

    public ProviderService(ProviderRepository providerRepo) {
        this.providerRepo = providerRepo;
    }

    public List<ProviderResponse> findAll() {
        return providerRepo.findAll().stream().map(this::toResponse).toList();
    }

    public List<ProviderResponse> findPendingApproval() {
        return providerRepo.findByIsApproved(false).stream().map(this::toResponse).toList();
    }

    public List<ProviderResponse> findApprovedByCategory(Long categoryId) {
        return providerRepo.findByCategoryIdAndIsApprovedTrue(categoryId)
                .stream().map(this::toResponse).toList();
    }

    public ProviderResponse findById(Long id) {
        return toResponse(providerRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found")));
    }
    
    public ProviderResponse findByUserId(Long userId) {

        return toResponse(
                providerRepo.findByUserId(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Provider not found"
                                ))
        );
    }

    @Transactional
    public ProviderResponse approve(Long id) {
        Provider p = providerRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        p.setIsApproved(true);
        return toResponse(p);
    }

   
    @Transactional
    public ProviderResponse updateRating(Long id, BigDecimal rating) {
        Provider p = providerRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        if (rating.compareTo(BigDecimal.ZERO) < 0 || rating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 0 and 5");
        }
        p.setRating(rating);
        return toResponse(p);
    }
    @Transactional
    public ProviderResponse toggleAvailability(Long id, Boolean availability) {
        Provider p = providerRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        // Only the provider themselves or an admin can toggle
        Long currentId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!p.getUser().getId().equals(currentId) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only toggle your own availability");
        }

        p.setAvailability(availability);
        return toResponse(p);
    }

    private ProviderResponse toResponse(Provider p) {
        return ProviderResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getUser().getName())
                .email(p.getUser().getEmail())
                .phone(p.getUser().getPhone())
                .categoryId(p.getCategoryId())
                .experience(p.getExperience())
                .availability(p.getAvailability())
                .rating(p.getRating())
                .isApproved(p.getIsApproved())
                .build();
    }
}
