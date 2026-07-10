package com.heaven4.core.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Root exception for all Heaven4 business exceptions.
 *
 * <p>Every domain-specific exception must extend this or one of its subclasses.
 * Never throw raw RuntimeException in Heaven4 code.
 */
@Getter
public class HeavenException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public HeavenException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public HeavenException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
}
