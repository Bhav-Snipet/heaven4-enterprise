package com.heaven4.engines.auth;

import lombok.Builder;
import lombok.Getter;

/**
 * Authentication result returned by the Authentication Engine.
 */
@Getter
@Builder
public class AuthResult {

    private Long userId;
    private String accessToken;
    private String refreshToken;
    private String role;
    private String workspace;
    private String displayName;
    private boolean newUser;
}
