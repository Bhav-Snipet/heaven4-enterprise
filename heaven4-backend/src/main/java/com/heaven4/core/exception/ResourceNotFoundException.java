package com.heaven4.core.exception;

import com.heaven4.core.ErrorCode;
import org.springframework.http.HttpStatus;

/** Thrown when a requested resource does not exist. */
public class ResourceNotFoundException extends HeavenException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id, ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String resourceName, String identifier) {
        super(resourceName + " not found: " + identifier, ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String message, String errorCode, boolean custom) {
        super(message, errorCode, HttpStatus.NOT_FOUND);
    }
}
