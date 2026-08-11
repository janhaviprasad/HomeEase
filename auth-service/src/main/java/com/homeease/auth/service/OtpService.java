package com.homeease.auth.service;

import com.homeease.auth.dto.AuthDtos.PendingRegistration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds registrations that have been submitted but not yet verified.
 *
 * In memory only, by design for this cycle: a restart drops pending
 * registrations, and those users simply register again. Nothing is written to
 * the database until the OTP is verified, so a dropped entry leaves no orphan
 * rows behind.
 */
@Service
public class OtpService {

    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpEntry> entries = new ConcurrentHashMap<>();

    private final int expiryMinutes;
    private final int maxAttempts;
    private final int resendCooldownSeconds;

    public OtpService(@Value("${app.otp.expiry-minutes:10}") int expiryMinutes,
                      @Value("${app.otp.max-attempts:5}") int maxAttempts,
                      @Value("${app.otp.resend-cooldown-seconds:30}") int resendCooldownSeconds) {
        this.expiryMinutes = expiryMinutes;
        this.maxAttempts = maxAttempts;
        this.resendCooldownSeconds = resendCooldownSeconds;
    }

    public static class OtpEntry {
        private String code;
        private Instant expiresAt;
        private Instant lastSentAt;
        private int attemptsLeft;
        private final PendingRegistration pending;

        OtpEntry(String code, Instant expiresAt, Instant lastSentAt, int attemptsLeft, PendingRegistration pending) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.lastSentAt = lastSentAt;
            this.attemptsLeft = attemptsLeft;
            this.pending = pending;
        }

        public int getAttemptsLeft() {
            return attemptsLeft;
        }

        public PendingRegistration getPending() {
            return pending;
        }
    }

    /** Emails are matched case-insensitively so Foo@x.com and foo@x.com are one entry. */
    private String key(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String newCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    /**
     * Lazy cleanup: an expired entry is dropped the next time its key is touched.
     * There is no sweeper thread, which is fine at demo volume.
     */
    private OtpEntry liveEntry(String key) {
        OtpEntry entry = entries.get(key);
        if (entry == null) {
            return null;
        }

        if (Instant.now().isAfter(entry.expiresAt)) {
            entries.remove(key);
            return null;
        }

        return entry;
    }

    public String generateAndStore(String email, PendingRegistration pending) {
        String code = newCode();
        Instant now = Instant.now();

        entries.put(key(email), new OtpEntry(
                code,
                now.plus(Duration.ofMinutes(expiryMinutes)),
                now,
                maxAttempts,
                pending));

        return code;
    }

    /**
     * On success the entry is consumed, so a code cannot be replayed.
     */
    public PendingRegistration verify(String email, String code) {
        String key = key(email);
        OtpEntry entry = entries.get(key);

        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No pending registration for this email. Please register again.");
        }

        if (Instant.now().isAfter(entry.expiresAt)) {
            entries.remove(key);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Code expired. Please request a new code.");
        }

        if (entry.attemptsLeft <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Too many attempts, please request a new code");
        }

        if (!entry.code.equals(code == null ? null : code.trim())) {
            entry.attemptsLeft--;
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid code");
        }

        entries.remove(key);
        return entry.pending;
    }

    /** Regenerates the code, resets attempts and extends the window. */
    public String resend(String email) {
        String key = key(email);
        OtpEntry entry = liveEntry(key);

        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No pending registration for this email. Please register again.");
        }

        Instant now = Instant.now();
        if (entry.lastSentAt.plusSeconds(resendCooldownSeconds).isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait before resending");
        }

        entry.code = newCode();
        entry.expiresAt = now.plus(Duration.ofMinutes(expiryMinutes));
        entry.lastSentAt = now;
        entry.attemptsLeft = maxAttempts;

        return entry.code;
    }
}
