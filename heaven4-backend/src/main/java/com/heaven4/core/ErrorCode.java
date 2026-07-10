package com.heaven4.core;

/**
 * All application-level error codes for Heaven4.
 *
 * <p>Format: DOMAIN_DETAIL (e.g. AUTH_INVALID_OTP, ORDER_NOT_FOUND)
 * <p>These codes are returned in ApiResponse.errorCode and logged for audit.
 */
public final class ErrorCode {

    private ErrorCode() {}

    // ===== GENERIC =====
    public static final String INTERNAL_ERROR       = "INTERNAL_ERROR";
    public static final String VALIDATION_FAILED    = "VALIDATION_FAILED";
    public static final String RESOURCE_NOT_FOUND   = "RESOURCE_NOT_FOUND";
    public static final String ACCESS_DENIED        = "ACCESS_DENIED";
    public static final String UNAUTHORIZED         = "UNAUTHORIZED";
    public static final String OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED";

    // ===== AUTH =====
    public static final String AUTH_INVALID_OTP         = "AUTH_INVALID_OTP";
    public static final String AUTH_OTP_EXPIRED         = "AUTH_OTP_EXPIRED";
    public static final String AUTH_OTP_MAX_ATTEMPTS    = "AUTH_OTP_MAX_ATTEMPTS";
    public static final String AUTH_TOKEN_EXPIRED       = "AUTH_TOKEN_EXPIRED";
    public static final String AUTH_TOKEN_INVALID       = "AUTH_TOKEN_INVALID";
    public static final String AUTH_USER_NOT_FOUND      = "AUTH_USER_NOT_FOUND";
    public static final String AUTH_USER_DISABLED       = "AUTH_USER_DISABLED";
    public static final String AUTH_GOOGLE_FAILED       = "AUTH_GOOGLE_FAILED";
    public static final String AUTH_WORKSPACE_MISMATCH  = "AUTH_WORKSPACE_MISMATCH";

    // ===== DINING SESSION =====
    public static final String SESSION_NOT_FOUND        = "SESSION_NOT_FOUND";
    public static final String SESSION_ALREADY_ACTIVE   = "SESSION_ALREADY_ACTIVE";
    public static final String SESSION_CLOSED           = "SESSION_CLOSED";
    public static final String SESSION_PAYMENT_PENDING  = "SESSION_PAYMENT_PENDING";

    // ===== TABLE =====
    public static final String TABLE_NOT_FOUND          = "TABLE_NOT_FOUND";
    public static final String TABLE_NOT_AVAILABLE      = "TABLE_NOT_AVAILABLE";
    public static final String TABLE_QR_INVALID         = "TABLE_QR_INVALID";

    // ===== ORDERING =====
    public static final String ORDER_NOT_FOUND          = "ORDER_NOT_FOUND";
    public static final String ORDER_CANNOT_CANCEL      = "ORDER_CANNOT_CANCEL";
    public static final String CART_EMPTY               = "CART_EMPTY";
    public static final String ITEM_NOT_AVAILABLE       = "ITEM_NOT_AVAILABLE";
    public static final String ITEM_NOT_FOUND           = "ITEM_NOT_FOUND";

    // ===== BILLING =====
    public static final String BILL_NOT_FOUND           = "BILL_NOT_FOUND";
    public static final String COUPON_NOT_FOUND         = "COUPON_NOT_FOUND";
    public static final String COUPON_EXPIRED           = "COUPON_EXPIRED";
    public static final String COUPON_ALREADY_USED      = "COUPON_ALREADY_USED";
    public static final String COUPON_MINIMUM_NOT_MET   = "COUPON_MINIMUM_NOT_MET";

    // ===== PAYMENT =====
    public static final String PAYMENT_NOT_FOUND        = "PAYMENT_NOT_FOUND";
    public static final String PAYMENT_FAILED           = "PAYMENT_FAILED";
    public static final String PAYMENT_ALREADY_DONE     = "PAYMENT_ALREADY_DONE";
    public static final String PAYMENT_APPROVAL_REQUIRED = "PAYMENT_APPROVAL_REQUIRED";

    // ===== MEMBERSHIP =====
    public static final String MEMBERSHIP_NOT_FOUND     = "MEMBERSHIP_NOT_FOUND";
    public static final String POINTS_INSUFFICIENT      = "POINTS_INSUFFICIENT";
    public static final String POINTS_EXPIRED           = "POINTS_EXPIRED";

    // ===== EMPLOYEE =====
    public static final String EMPLOYEE_NOT_FOUND       = "EMPLOYEE_NOT_FOUND";
    public static final String EMPLOYEE_TABLE_NOT_ASSIGNED = "EMPLOYEE_TABLE_NOT_ASSIGNED";

    // ===== APPROVAL =====
    public static final String APPROVAL_REQUIRED        = "APPROVAL_REQUIRED";
    public static final String APPROVAL_NOT_FOUND       = "APPROVAL_NOT_FOUND";
    public static final String APPROVAL_ALREADY_PROCESSED = "APPROVAL_ALREADY_PROCESSED";
}
