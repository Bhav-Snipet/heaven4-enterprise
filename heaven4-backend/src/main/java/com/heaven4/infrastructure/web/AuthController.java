package com.heaven4.infrastructure.web;

import com.heaven4.core.ApiResponse;
import com.heaven4.engines.auth.AuthResult;
import com.heaven4.engines.auth.AuthenticationEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for OTP and JWT management")
public class AuthController {

    private final AuthenticationEngine authEngine;

    @PostMapping("/request-otp")
    @Operation(summary = "Request OTP", description = "Generates and sends an OTP to the given phone number")
    public ApiResponse<String> requestOtp(@Valid @RequestBody OtpRequest request) {
        String result = authEngine.sendOtp(request.getPhoneNumber());
        return ApiResponse.success("OTP sent", result);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP", description = "Verifies the OTP and returns JWT tokens")
    public ApiResponse<AuthResult> verifyOtp(@Valid @RequestBody VerifyRequest request) {
        AuthResult result = authEngine.verifyOtp(request.getPhoneNumber(), request.getOtpCode());
        return ApiResponse.success("Authentication successful", result);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Token", description = "Generates a new access token using a refresh token")
    public ApiResponse<AuthResult> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResult result = authEngine.refreshToken(request.getRefreshToken());
        return ApiResponse.success("Token refreshed", result);
    }

    @PostMapping("/login/password")
    @Operation(summary = "Login with Password", description = "Login using identifier and password")
    public ApiResponse<AuthResult> loginWithPassword(@Valid @RequestBody PasswordLoginRequest request) {
        AuthResult result = authEngine.loginWithPassword(request.getIdentifier(), request.getPassword());
        return ApiResponse.success("Authentication successful", result);
    }

    @Data
    public static class OtpRequest {
        @NotBlank(message = "Phone number is required")
        private String phoneNumber;
    }

    @Data
    public static class VerifyRequest {
        @NotBlank(message = "Phone number is required")
        private String phoneNumber;
        
        @NotBlank(message = "OTP code is required")
        private String otpCode;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    @Data
    public static class PasswordLoginRequest {
        @NotBlank(message = "Identifier is required")
        private String identifier;
        
        @NotBlank(message = "Password is required")
        private String password;
    }
}
