package com.homeease.auth.repository;

import com.homeease.auth.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUserId(Long userId);
    List<Provider> findByIsApproved(Boolean isApproved);
    List<Provider> findByCategoryIdAndIsApprovedTrue(Long categoryId);
}
