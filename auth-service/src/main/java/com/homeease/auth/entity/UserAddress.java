package com.homeease.auth.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class UserAddress {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "user_id", nullable = false)
	    private User user;

	    @Column(length = 50)
	    private String label;

	    @Column(name = "address_line", nullable = false)
	    private String addressLine;

	    @Column(length = 100)
	    private String city;

	    @Column(length = 10)
	    private String pincode;

	    @Column(name = "is_default")
	    private Boolean isDefault;

	    @Column(name = "created_at", updatable = false)
	    private LocalDateTime createdAt;

	    @Column(name = "updated_at")
	    private LocalDateTime updatedAt;
}
