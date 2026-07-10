package com.heaven4.core.exception;

import com.heaven4.core.ErrorCode;
import org.springframework.http.HttpStatus;

/** Thrown when a user lacks permission for an action. */
public class AccessDeniedException extends HeavenException {

    public AccessDeniedException(String message) {
        super(message, ErrorCode.ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }

    public AccessDeniedException() {
        super("Access denied. You do not have permission to perform this action.",
                ErrorCode.ACCESS_DENIED, HttpStatus.FORBIDDEN);
    }
}
