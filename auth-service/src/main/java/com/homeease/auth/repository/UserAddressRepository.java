package com.homeease.auth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.homeease.auth.entity.UserAddress;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long>{
	
	List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

}
