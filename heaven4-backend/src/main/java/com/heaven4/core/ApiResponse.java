package com.heaven4.core;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;

/**
 * Standard API response wrapper for all Heaven4 endpoints.
 *
 * <p>Every response — success or error — uses this structure:
 * <pre>
 * {
 *   "success": true,
 *   "message": "Operation completed",
 *   "data": { ... },
 *   "timestamp": "2026-07-09T18:30:00Z"
 * }
 * </pre>
 *
 * @param <T> The type of the response data payload
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final String error;
    private final String errorCode;
    private final Instant timestamp;

    private ApiResponse(boolean success, String message, T data, String error, String errorCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.errorCode = errorCode;
        this.timestamp = Instant.now();
    }

    /**
     * Creates a successful response with data payload.
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, null, null);
    }

    /**
     * Creates a successful response with a custom message and data.
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, null);
    }

    /**
     * Creates a successful response with only a message (no data payload).
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null, null, null);
    }

    /**
     * Creates an error response with a message and error code.
     */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return new ApiResponse<>(false, null, null, message, errorCode);
    }

    /**
     * Creates an error response with a message, error code, and data payload.
     */
    public static <T> ApiResponse<T> error(String message, String errorCode, T data) {
        return new ApiResponse<>(false, null, data, message, errorCode);
    }

    /**
     * Creates an error response with only a message.
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, null, message, "INTERNAL_ERROR");
    }
}
