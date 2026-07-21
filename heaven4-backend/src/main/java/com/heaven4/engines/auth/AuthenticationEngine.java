package com.heaven4.engines.auth;

/**
 * Authentication Engine — handles all identity and session operations.
 *
 * <p>Manages: phone login, Google OAuth, OTP generation/validation,
 * JWT generation, refresh tokens, session management, device tracking.
 */
public interface AuthenticationEngine {

    /** Sends an OTP to the given phone number. Returns a masked confirmation. */
    String sendOtp(String phoneNumber);

    /** Validates the OTP for a phone number and returns an auth result. */
    AuthResult verifyOtp(String phoneNumber, String otp);

    /** Authenticates via Google OAuth token and returns an auth result. */
    AuthResult authenticateWithGoogle(String googleIdToken);

    /** Refreshes an access token using a valid refresh token. */
    AuthResult refreshToken(String refreshToken);

    /** Logs out the user by invalidating the current session/refresh token. */
    void logout(Long userId, String refreshToken);

    /** Checks if a session is still valid. */
    boolean isSessionValid(Long userId, String sessionId);

    /** Authenticates a staff member using ID (phone/email) and password */
    AuthResult loginWithPassword(String identifier, String password);
}
