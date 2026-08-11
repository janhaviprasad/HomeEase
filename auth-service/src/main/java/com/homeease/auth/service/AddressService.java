package com.homeease.auth.service;

import com.homeease.auth.dto.AddressRequest;
import com.homeease.auth.dto.AddressResponse;
import com.homeease.auth.entity.User;
import com.homeease.auth.entity.UserAddress;
import com.homeease.auth.repository.UserAddressRepository;
import com.homeease.auth.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
//@RequiredArgsConstructor
public class AddressService {
	
	public AddressService(UserRepository userRepository,UserAddressRepository addressRepository) {
	    this.userRepository = userRepository;
	    this.addressRepository = addressRepository;
	}
	
	private final UserRepository userRepository;
	private final UserAddressRepository addressRepository;
	
	private Long currentUserId() {

	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    return (Long) authentication.getPrincipal();
	}
	
	
	private AddressResponse toResponse(UserAddress address) {
		return AddressResponse.builder()
	            .id(address.getId())
	            .label(address.getLabel())
	            .addressLine(address.getAddressLine())
	            .city(address.getCity())
	            .pincode(address.getPincode())
	            .isDefault(address.getIsDefault())
	            .build();
	}
	
	public List<AddressResponse> listMine() {
	    Long userId = currentUserId();
	    return addressRepository
	            .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
	            .stream()
	            .map(this::toResponse)
	            .collect(Collectors.toList());
	}
	
	public AddressResponse create(AddressRequest request) {

	    Long userId = currentUserId();

	    User user = userRepository.findById(userId)
	            .orElseThrow(() ->
	                    new RuntimeException("User not found"));

	    UserAddress address = UserAddress.builder()
	            .user(user)
	            .label(request.getLabel())
	            .addressLine(request.getAddressLine())
	            .city(request.getCity())
	            .pincode(request.getPincode())
	            .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
	            .createdAt(LocalDateTime.now())
	            .updatedAt(LocalDateTime.now())
	            .build();

	    addressRepository.save(address);

	    return toResponse(address);
	}
	
	private UserAddress findOwnedByCurrentUser(Long addressId) {

	    Long userId = currentUserId();

	    UserAddress address = addressRepository.findById(addressId).orElseThrow(() ->
	                    new RuntimeException("Address not found"));

	    if (!address.getUser().getId().equals(userId)) {
	    	throw new ResponseStatusException(
	    	        HttpStatus.FORBIDDEN,
	    	        "Access denied"
	    	);
	    }

	    return address;
	}
	
	public AddressResponse update(Long id, AddressRequest request) {

	    UserAddress address = findOwnedByCurrentUser(id);

	    address.setLabel(request.getLabel());
	    address.setAddressLine(request.getAddressLine());
	    address.setCity(request.getCity());
	    address.setPincode(request.getPincode());
	    address.setIsDefault(request.getIsDefault());
	    address.setUpdatedAt(LocalDateTime.now());

	    addressRepository.save(address);

	    return toResponse(address);
	}
	
	public void delete(Long id) {
	    UserAddress address = findOwnedByCurrentUser(id);
	    addressRepository.delete(address);
	}
	
	public void markDefault(Long id) {

	    UserAddress selected = findOwnedByCurrentUser(id);

	    List<UserAddress> addresses =
	            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(currentUserId());

	    for (UserAddress address : addresses) {
	        address.setIsDefault(address.getId().equals(selected.getId()));
	    }

	    addressRepository.saveAll(addresses);
	}
	

}
