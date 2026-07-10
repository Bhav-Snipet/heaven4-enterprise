package com.heaven4.security;

import com.heaven4.core.HeavenConstants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JWT token provider for Heaven4 authentication.
 *
 * <p>Handles generation and validation of access tokens and refresh tokens.
 * All tokens include workspace and role claims for workspace-aware security.
 */
@Component
@Slf4j
public class JwtProvider {

    @Value("${heaven4.security.jwt.secret}")
    private String jwtSecret;

    @Value("${heaven4.security.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${heaven4.security.jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a JWT access token with user ID, role, and workspace claims.
     */
    public String generateAccessToken(Long userId, String role, String workspace) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(HeavenConstants.JWT_CLAIM_USER_ID, userId)
                .claim(HeavenConstants.JWT_CLAIM_ROLE, role)
                .claim(HeavenConstants.JWT_CLAIM_WORKSPACE, workspace)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Generates a JWT refresh token.
     */
    public String generateRefreshToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim(HeavenConstants.JWT_CLAIM_USER_ID, userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiryMs))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates a JWT token and returns the claims.
     *
     * @throws JwtException if token is invalid or expired
     */
    public Claims validateAndExtractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts the user ID from a token without full validation.
     */
    public Long extractUserId(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims.get(HeavenConstants.JWT_CLAIM_USER_ID, Long.class);
    }

    /**
     * Extracts the role from a token.
     */
    public String extractRole(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims.get(HeavenConstants.JWT_CLAIM_ROLE, String.class);
    }

    /**
     * Extracts the workspace from a token.
     */
    public String extractWorkspace(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims.get(HeavenConstants.JWT_CLAIM_WORKSPACE, String.class);
    }

    /**
     * Returns true if the token is a valid, non-expired JWT.
     */
    public boolean isTokenValid(String token) {
        try {
            validateAndExtractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }
}
