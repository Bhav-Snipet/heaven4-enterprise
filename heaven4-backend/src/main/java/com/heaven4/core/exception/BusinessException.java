package com.heaven4.core.exception;

import com.heaven4.core.ErrorCode;
import org.springframework.http.HttpStatus;

/**
 * Thrown when a business rule violation occurs.
 *
 * <p>Examples:
 * <ul>
 *   <li>Order cannot be cancelled after preparation starts</li>
 *   <li>Coupon minimum order value not met</li>
 *   <li>Session already has an active bill</li>
 * </ul>
 */
public class BusinessException extends HeavenException {

    public BusinessException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public BusinessException(String message) {
        super(message, ErrorCode.OPERATION_NOT_ALLOWED, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
