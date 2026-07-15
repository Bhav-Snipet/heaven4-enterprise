package com.heaven4.infrastructure.web;

import com.heaven4.engines.membership.MembershipEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardsController {

    private final MembershipEngine membershipEngine;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        Long userId = Long.parseLong(principal.getName());
        int balance = membershipEngine.getPointBalance(userId);
        String tier = membershipEngine.getCurrentTier(userId);
        return ResponseEntity.ok(Map.of(
                "pointsBalance", balance,
                "tier", tier
        ));
    }
}
