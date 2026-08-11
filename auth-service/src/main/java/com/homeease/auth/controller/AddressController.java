package com.homeease.auth.controller;


import com.homeease.auth.dto.AddressRequest;
import com.homeease.auth.dto.AddressResponse;
import com.homeease.auth.service.AddressService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor

public class AddressController {
	
	private final AddressService addressService;
	
	@GetMapping
	public ResponseEntity<List<AddressResponse>> listMine() {
	    return ResponseEntity.ok(addressService.listMine() );
	}
	
	@PostMapping
	public ResponseEntity<AddressResponse> create(@Valid @RequestBody AddressRequest request) {
	    AddressResponse response = addressService.create(request);
	    System.out.println("Address Controller Called");
	    return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<AddressResponse> update(@PathVariable Long id, @Valid @RequestBody AddressRequest request) {
	    return ResponseEntity.ok(
	            addressService.update(id, request));
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		addressService.delete(id);
	    return ResponseEntity.noContent().build();
	}
	
	@PutMapping("/{id}/default")
	public ResponseEntity<Void> markDefault(@PathVariable Long id) {
	    addressService.markDefault(id);
	    return ResponseEntity.ok().build();
	}

}
