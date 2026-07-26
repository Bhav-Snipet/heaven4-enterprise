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
    private final com.heaven4.domain.identity.repository.UserRepository userRepository;
    private final com.heaven4.domain.identity.repository.UnblockRequestRepository unblockRequestRepository;

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

    @PostMapping("/google")
    @Operation(summary = "Login with Google", description = "Login using Google token")
    public ApiResponse<AuthResult> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResult result = authEngine.loginWithGoogle(request.getToken());
        return ApiResponse.success("Google Authentication successful", result);
    }

    @PostMapping("/unblock-request")
    @Operation(summary = "Submit Unblock Request", description = "Submit a reason to be unblocked")
    public ApiResponse<String> submitUnblockRequest(@RequestBody UnblockRequestDto request) {
        
        com.heaven4.domain.identity.entity.User user = userRepository.findByPhoneNumber(request.getIdentifier())
            .orElseGet(() -> userRepository.findByEmail(request.getIdentifier()).orElse(null));
            
        if (user == null) {
            return ApiResponse.success("If the account exists and is blocked, the request will be submitted", null);
        }
        
        if (!Boolean.TRUE.equals(user.getIsBlocked())) {
            return ApiResponse.success("Account is not blocked", null);
        }
        
        com.heaven4.domain.identity.entity.UnblockRequest unblockRequest = new com.heaven4.domain.identity.entity.UnblockRequest();
        unblockRequest.setUser(user);
        unblockRequest.setReason(request.getReason());
        unblockRequestRepository.save(unblockRequest);
        
        return ApiResponse.success("Unblock request submitted successfully", null);
    }

    @Data
    public static class UnblockRequestDto {
        private String identifier;
        private String reason;
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

    @Data
    public static class GoogleLoginRequest {
        @NotBlank(message = "Google token is required")
        private String token;
    }
}
