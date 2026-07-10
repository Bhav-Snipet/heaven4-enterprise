package com.heaven4.core.exception;

import com.heaven4.core.ErrorCode;
import org.springframework.http.HttpStatus;

/** Thrown when request is not authenticated (missing or invalid JWT). */
public class UnauthorizedException extends HeavenException {

    public UnauthorizedException(String message) {
        super(message, ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    public UnauthorizedException() {
        super("Authentication required. Please login to continue.",
                ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
}
