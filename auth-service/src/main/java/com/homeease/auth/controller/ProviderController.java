package com.homeease.auth.controller;

import com.homeease.auth.dto.AuthDtos.ProviderResponse;
import com.homeease.auth.dto.AuthDtos.RatingUpdateRequest;
import com.homeease.auth.service.ProviderService;
//import com.homeease.auth.controller.Resp; // <-- Change this to your actual package

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final ProviderService providerService;

    public ProviderController(ProviderService providerService) {
        this.providerService = providerService;
    }

    /** All providers. Admin uses this for the dashboard. */
    @GetMapping
    public ResponseEntity<Resp<List<ProviderResponse>>> findAll(
            @RequestParam(required = false) Boolean pending,
            @RequestParam(required = false) Long categoryId) {

        if (pending != null && pending) {
            return ResponseEntity.ok(
                    Resp.success(providerService.findPendingApproval())
            );
        }

        if (categoryId != null) {
            return ResponseEntity.ok(
                    Resp.success(providerService.findApprovedByCategory(categoryId))
            );
        }

        return ResponseEntity.ok(
                Resp.success(providerService.findAll())
        );
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Resp<ProviderResponse>> findByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                Resp.success(providerService.findByUserId(userId))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resp<ProviderResponse>> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                Resp.success(providerService.findById(id))
        );
    }

    /** Admin-only (enforced in SecurityConfig). */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Resp<ProviderResponse>> approve(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                Resp.success(providerService.approve(id))
        );
    }

    /**
     * Called by Booking Service after a review is created.
     */
    @PutMapping("/{id}/rating")
    public ResponseEntity<Resp<ProviderResponse>> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingUpdateRequest req) {

        return ResponseEntity.ok(
                Resp.success(
                        providerService.updateRating(id, req.getRating())
                )
        );
    }
    @PutMapping("/{id}/availability")
    public ResponseEntity<ProviderResponse> toggleAvailability(
            @PathVariable Long id,
            @RequestParam Boolean available) {
        return ResponseEntity.ok(providerService.toggleAvailability(id, available));
    }
}