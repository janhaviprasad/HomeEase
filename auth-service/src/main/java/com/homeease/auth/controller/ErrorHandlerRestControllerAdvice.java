package com.homeease.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ErrorHandlerRestControllerAdvice {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Resp<?>> handleError(Exception e) {

        if (e instanceof ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Resp.error(
                            ex.getClass().getName() + " :" +
                            ex.getStatusCode() + " \"" +
                            ex.getReason() + "\""));
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Resp.error(
                        e.getClass().getName() + " :" +
                        e.getMessage()));
    }
}