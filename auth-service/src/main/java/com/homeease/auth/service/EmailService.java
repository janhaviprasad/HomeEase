package com.homeease.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final int expiryMinutes;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String fromAddress,
                        @Value("${app.otp.expiry-minutes:10}") int expiryMinutes) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.expiryMinutes = expiryMinutes;
    }

    /**
     * Sends the registration OTP. Never throws: a mail failure must not fail the
     * registration request, because the code is already stored and the caller can
     * ask for a resend. The code itself is never logged.
     */
    public void sendOtpEmail(String toEmail, String code) {

        if (fromAddress == null || fromAddress.isBlank()) {
            log.error("MAIL_USERNAME is not set - OTP email to {} was not sent. See .env.example.", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("HomeEase - Verify your email");
            message.setText(
                    "Welcome to HomeEase.\n\n"
                            + "Your verification code is: " + code + "\n\n"
                            + "It expires in " + expiryMinutes + " minutes. "
                            + "Enter it in the app to finish creating your account.\n\n"
                            + "If you did not request this, you can ignore this email.\n");

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }
}
