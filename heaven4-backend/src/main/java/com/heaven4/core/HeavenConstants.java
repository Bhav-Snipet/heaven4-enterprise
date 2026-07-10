package com.heaven4.core;

/**
 * Application-wide constants for Heaven4 Enterprise.
 *
 * <p>Never use magic strings or numbers in business logic — use these constants.
 */
public final class HeavenConstants {

    private HeavenConstants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }

    // ===== API =====
    public static final String API_V1 = "/api/v1";
    public static final String SYSTEM_USER = "SYSTEM";

    // ===== WORKSPACE PATHS =====
    public static final String WORKSPACE_CUSTOMER   = "/customer";
    public static final String WORKSPACE_EMPLOYEE   = "/employee";
    public static final String WORKSPACE_KITCHEN    = "/kitchen";
    public static final String WORKSPACE_MANAGER    = "/manager";
    public static final String WORKSPACE_ADMIN      = "/admin";
    public static final String WORKSPACE_OWNER      = "/owner";

    // ===== ROLES =====
    public static final String ROLE_CUSTOMER    = "ROLE_CUSTOMER";
    public static final String ROLE_EMPLOYEE    = "ROLE_EMPLOYEE";
    public static final String ROLE_KITCHEN     = "ROLE_KITCHEN";
    public static final String ROLE_BARTENDER   = "ROLE_BARTENDER";
    public static final String ROLE_MANAGER     = "ROLE_MANAGER";
    public static final String ROLE_ADMIN       = "ROLE_ADMIN";
    public static final String ROLE_OWNER       = "ROLE_OWNER";

    // ===== JWT =====
    public static final String JWT_TOKEN_PREFIX     = "Bearer ";
    public static final String JWT_HEADER_NAME      = "Authorization";
    public static final String JWT_CLAIM_ROLE       = "role";
    public static final String JWT_CLAIM_WORKSPACE  = "workspace";
    public static final String JWT_CLAIM_USER_ID    = "userId";

    // ===== PAGINATION =====
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE     = 100;

    // ===== PHONE / OTP =====
    public static final int OTP_LENGTH        = 6;
    public static final int OTP_MAX_ATTEMPTS  = 3;
    public static final int OTP_EXPIRY_MINUTES = 5;

    // ===== DINING SESSION =====
    public static final int SESSION_AUTO_CLOSE_HOURS = 8;

    // ===== HEAVEN REWARDS =====
    public static final int POINTS_EARN_RATE_PERCENT = 1; // 1 point per ₹100 spent (configurable via DB)
    public static final int POINTS_REDEEM_RATE = 100;     // 100 points = ₹1 (configurable via DB)

    // ===== AUDIT =====
    public static final String AUDIT_ACTION_CREATE  = "CREATE";
    public static final String AUDIT_ACTION_UPDATE  = "UPDATE";
    public static final String AUDIT_ACTION_DELETE  = "DELETE";
    public static final String AUDIT_ACTION_LOGIN   = "LOGIN";
    public static final String AUDIT_ACTION_LOGOUT  = "LOGOUT";
    public static final String AUDIT_ACTION_APPROVE = "APPROVE";
    public static final String AUDIT_ACTION_REJECT  = "REJECT";
    public static final String AUDIT_ACTION_OVERRIDE = "OVERRIDE";

    // ===== DATE/TIME =====
    public static final String DATE_FORMAT     = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

    // ===== KITCHEN TIMERS (minutes) =====
    public static final int KITCHEN_TIMER_GREEN  = 10;
    public static final int KITCHEN_TIMER_YELLOW = 20;
    // above 20 = RED

    // ===== TABLE STATUS =====
    public static final String TABLE_STATUS_AVAILABLE = "AVAILABLE";
    public static final String TABLE_STATUS_DINING    = "DINING";
    public static final String TABLE_STATUS_WAITING_FOOD = "WAITING_FOOD";
    public static final String TABLE_STATUS_WAITING_BILL = "WAITING_BILL";
    public static final String TABLE_STATUS_NEEDS_ATTENTION = "NEEDS_ATTENTION";
}
