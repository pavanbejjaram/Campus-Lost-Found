package com.college.lostfound.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Catches any exception that isn't already handled inside a controller and:
 *  1. Prints the full stack trace to the backend console (so we can see the real cause).
 *  2. Returns a JSON body with an actual "message" field, so the frontend's
 *     `resData.message` isn't undefined and the user sees something meaningful
 *     instead of a generic "Failed to submit report".
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAnyException(Exception ex) {
        ex.printStackTrace(); // full trace in the backend terminal/log
        String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ResponseEntity.status(500).body(Map.of("message", "Server error: " + message));
    }
}
