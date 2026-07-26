package com.heaven4.infrastructure.web;

import com.heaven4.engines.membership.MembershipEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardsController {

    private final MembershipEngine membershipEngine;
    private final com.heaven4.domain.billing.repository.RewardsProfileRepository profileRepository;
    private final com.heaven4.domain.identity.repository.UserRepository userRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER', 'DEVELOPER')")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(Map.of("pointsBalance", 0, "tier", "BRONZE"));
        }
        Long userId;
        try {
            userId = Long.parseLong(principal.getName());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("pointsBalance", 0, "tier", "BRONZE"));
        }
        int balance = membershipEngine.getPointBalance(userId);
        String tier = membershipEngine.getCurrentTier(userId);
        return ResponseEntity.ok(Map.of(
                "pointsBalance", balance,
                "tier", tier
        ));
    }

    @PostMapping("/upgrade")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER', 'DEVELOPER')")
    public ResponseEntity<Map<String, Object>> upgradeMembership(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        
        com.heaven4.domain.billing.RewardsProfile profile = profileRepository.findByUserId(userId)
            .orElseGet(() -> {
                com.heaven4.domain.identity.entity.User u = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                com.heaven4.domain.billing.RewardsProfile p = new com.heaven4.domain.billing.RewardsProfile();
                p.setUser(u);
                p.setPointsBalance(0);
                p.setTotalLifetimeSpend(java.math.BigDecimal.ZERO);
                p.setTier("BRONZE");
                return profileRepository.save(p);
            });
            
        profile.addLifetimeSpend(new java.math.BigDecimal("1500"));
        profileRepository.save(profile);
        
        int balance = membershipEngine.getPointBalance(userId);
        String tier = membershipEngine.getCurrentTier(userId);
        return ResponseEntity.ok(Map.of(
                "pointsBalance", balance,
                "tier", tier,
                "message", "Successfully upgraded membership!"
        ));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER', 'DEVELOPER')")
    public ResponseEntity<List<?>> getPointsHistory(Principal principal) {
        if (principal == null) return ResponseEntity.ok(List.of());
        try {
            Long userId = Long.parseLong(principal.getName());
            return ResponseEntity.ok(membershipEngine.getPointHistory(userId, 0, 50));
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
