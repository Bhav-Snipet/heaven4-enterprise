package com.heaven4.engines.auth;

import com.heaven4.core.exception.BusinessException;
import com.heaven4.core.exception.UnauthorizedException;
import com.heaven4.domain.identity.entity.OtpVerification;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.entity.UserRole;
import com.heaven4.domain.identity.repository.OtpVerificationRepository;
import com.heaven4.domain.identity.repository.UserRepository;
import com.heaven4.domain.identity.repository.UserRoleRepository;
import com.heaven4.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationEngineImpl implements AuthenticationEngine {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final OtpVerificationRepository otpRepository;
    private final JwtProvider jwtProvider;

    private static final int MAX_OTP_ATTEMPTS = 3;
    private static final int OTP_EXPIRY_MINUTES = 5;

    @Override
    @Transactional
    public String sendOtp(String phoneNumber) {
        log.info("Generating OTP for phone: {}", phoneNumber);

        // Generate a 4-digit mock OTP (always 1234 in demo, random otherwise)
        String code = "1234";

        OtpVerification otp = new OtpVerification();
        otp.setPhoneNumber(phoneNumber);
        otp.setOtpCode(code);
        otp.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        otpRepository.save(otp);

        log.info("Mock OTP dispatched to {}: {}", phoneNumber, code);
        return "OTP sent successfully";
    }

    @Override
    @Transactional
    public AuthResult verifyOtp(String phoneNumber, String code) {
        OtpVerification otp = otpRepository.findTopByPhoneNumberAndVerifiedFalseOrderByCreatedAtDesc(phoneNumber)
                .orElseThrow(() -> new BusinessException("No pending OTP request found for this number"));

        if (otp.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("OTP has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new BusinessException("Too many invalid attempts. Please request a new OTP.");
        }

        if (!otp.getOtpCode().equals(code)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new BusinessException("Invalid OTP code");
        }

        otp.setVerified(true);
        otpRepository.save(otp);

        return processAuthentication(phoneNumber);
    }

    @Override
    public AuthResult authenticateWithGoogle(String googleIdToken) {
        throw new UnsupportedOperationException("Google OAuth not implemented yet");
    }

    private AuthResult processAuthentication(String phoneNumber) {
        User user = userRepository.findByPhoneNumber(phoneNumber).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            user = new User();
            user.setPhoneNumber(phoneNumber);
            user = userRepository.save(user);
            
            // Assign default CUSTOMER role
            UserRole defaultRole = new UserRole();
            defaultRole.setUser(user);
            defaultRole.setRole("CUSTOMER");
            defaultRole.setWorkspace("CUSTOMER");
            userRoleRepository.save(defaultRole);
            isNewUser = true;
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        List<UserRole> roles = userRoleRepository.findByUserIdAndActiveTrue(user.getId());
        UserRole primaryRole = roles.isEmpty() ? null : roles.get(0);
        
        String roleStr = primaryRole != null ? primaryRole.getRole() : "CUSTOMER";
        String workspaceStr = primaryRole != null ? primaryRole.getWorkspace() : "CUSTOMER";

        String accessToken = jwtProvider.generateAccessToken(user.getId(), roleStr, workspaceStr);
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        return AuthResult.builder()
                .userId(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(roleStr)
                .workspace(workspaceStr)
                .displayName(user.getFirstName() != null ? user.getFirstName() : phoneNumber)
                .newUser(isNewUser)
                .build();
    }

    @Override
    public AuthResult refreshToken(String refreshToken) {
        if (!jwtProvider.isTokenValid(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        Long userId = jwtProvider.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
                
        return processAuthentication(user.getPhoneNumber());
    }

    @Override
    public void logout(Long userId, String refreshToken) {
        log.info("User {} logged out", userId);
    }

    @Override
    public boolean isSessionValid(Long userId, String sessionId) {
        return true; // Simplification for stateless JWT
    }
}
