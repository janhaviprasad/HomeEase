package com.homeease.auth.security;

import com.homeease.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


@Component
public class JwtUtil {

    private final SecretKey signingKey;
   // private final long expirationMs;

    // @Value("${app.jwt.expiration-ms}") long expirationMs
    public JwtUtil(@Value("${app.jwt.secret}") String secret ) {
       
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
      //  this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role",  user.getRole().name());
        claims.put("email", user.getEmail());
        claims.put("name",  user.getName());

        Date now = new Date();
        //Date exp = new Date(now.getTime() + expirationMs);

        //.expiration(exp)
        return Jwts.builder()
                .claims(claims)
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .signWith(signingKey)
                .compact();
    }

    public Long extractUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

   /* public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }*/
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);

            Date expiration = claims.getExpiration();

            return expiration == null || expiration.after(new Date());

        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
