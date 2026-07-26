package com.heaven4.infrastructure.web;

import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.domain.catalog.repository.MenuItemRepository;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.entity.UserRole;
import com.heaven4.domain.identity.repository.UserRepository;
import com.heaven4.domain.identity.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final MenuItemRepository menuItemRepository;
    private final com.heaven4.domain.identity.repository.UnblockRequestRepository unblockRequestRepository;
    private final com.heaven4.domain.billing.repository.RewardsProfileRepository rewardsProfileRepository;

    // --- USER MANAGEMENT ---


    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : users) {
            List<UserRole> roles = userRoleRepository.findByUserIdAndActiveTrue(user.getId());
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("phoneNumber", user.getPhoneNumber());
            userMap.put("displayName", (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : ""));
            userMap.put("roles", roles.stream().map(r -> Map.of("id", r.getId(), "role", r.getRole(), "workspace", r.getWorkspace())).toList());
            userMap.put("lastLoginAt", user.getLastLoginAt());
            result.add(userMap);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, String>> assignRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Enforce hierarchy: Admin cannot edit Owner
        boolean isCurrentUserOwner = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
                
        if (!isCurrentUserOwner && userRoleRepository.findByUserIdAndActiveTrue(userId)
                .stream().anyMatch(r -> r.getRole().equals("OWNER"))) {
            throw new RuntimeException("Admins cannot modify OWNER roles");
        }

        // Deactivate existing roles
        List<UserRole> existingRoles = userRoleRepository.findByUserIdAndActiveTrue(userId);
        existingRoles.forEach(r -> r.setActive(false));
        userRoleRepository.saveAll(existingRoles);

        // Create new role
        UserRole newRole = new UserRole();
        newRole.setUser(user);
        newRole.setRole(body.get("role").toUpperCase());
        newRole.setWorkspace(body.getOrDefault("workspace", body.get("role").toUpperCase()));
        userRoleRepository.save(newRole);

        return ResponseEntity.ok(Map.of("message", "Role assigned successfully"));
    }

    // --- KITCHEN LOAD MODE ---

    @PutMapping("/kitchen-load-mode")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> toggleKitchenLoadMode(@RequestBody Map<String, Boolean> body) {
        boolean enable = Boolean.TRUE.equals(body.get("enabled"));
        List<MenuItem> allItems = menuItemRepository.findAll();

        if (enable) {
            // Deactivate items with high spiciness level (simulates complex/slow items)
            // In a real system you'd have a "prep time" field; using spicinessLevel >= 2 as proxy
            List<MenuItem> complexItems = allItems.stream()
                    .filter(i -> i.getSpicinessLevel() != null && i.getSpicinessLevel() >= 2)
                    .toList();
            complexItems.forEach(i -> i.setIsAvailable(false));
            menuItemRepository.saveAll(complexItems);
            return ResponseEntity.ok(Map.of("enabled", true, "deactivatedCount", complexItems.size(),
                    "message", "Kitchen Load Mode ON - " + complexItems.size() + " complex items deactivated"));
        } else {
            // Reactivate all items
            allItems.forEach(i -> i.setIsAvailable(true));
            menuItemRepository.saveAll(allItems);
            return ResponseEntity.ok(Map.of("enabled", false, "message", "Kitchen Load Mode OFF - All items reactivated"));
        }
    }

    // --- MENU ITEM TOGGLE ---

    @PutMapping("/catalog/items/{itemId}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> toggleItemActive(@PathVariable Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setIsAvailable(!item.getIsAvailable());
        menuItemRepository.save(item);
        return ResponseEntity.ok(Map.of("id", item.getId(), "isAvailable", item.getIsAvailable(),
                "name", item.getName()));
    }

    // --- BLOCK / UNBLOCK ---

    @PutMapping("/users/{userId}/block")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> toggleBlockUser(@PathVariable Long userId, @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        boolean block = body.getOrDefault("block", true);
        
        // Prevent blocking OWNER
        if (block && userRoleRepository.findByUserIdAndActiveTrue(userId).stream().anyMatch(r -> r.getRole().equals("OWNER"))) {
            throw new RuntimeException("Cannot block an OWNER");
        }
        
        user.setIsBlocked(block);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", block ? "User blocked" : "User unblocked", "isBlocked", block));
    }

    @GetMapping("/unblock-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<com.heaven4.domain.identity.entity.UnblockRequest>> getUnblockRequests() {
        return ResponseEntity.ok(unblockRequestRepository.findByStatus("PENDING"));
    }

    @PutMapping("/unblock-requests/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, String>> approveUnblockRequest(@PathVariable Long id) {
        com.heaven4.domain.identity.entity.UnblockRequest req = unblockRequestRepository.findById(id).orElseThrow();
        req.setStatus("APPROVED");
        unblockRequestRepository.save(req);
        
        User user = req.getUser();
        user.setIsBlocked(false);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
    }

    @PutMapping("/unblock-requests/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, String>> rejectUnblockRequest(@PathVariable Long id) {
        com.heaven4.domain.identity.entity.UnblockRequest req = unblockRequestRepository.findById(id).orElseThrow();
        req.setStatus("REJECTED");
        unblockRequestRepository.save(req);
        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    @PutMapping("/users/{userId}/tier")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'MANAGER')")
    public ResponseEntity<Map<String, String>> updateUserTier(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        
        String newTier = body.get("tier");
        if (newTier == null) throw new RuntimeException("Tier is required");
        
        com.heaven4.domain.billing.RewardsProfile membership = rewardsProfileRepository.findByUserId(userId).orElse(null);
        if (membership == null) {
            membership = new com.heaven4.domain.billing.RewardsProfile();
            User u = userRepository.findById(userId).orElseThrow();
            membership.setUser(u);
            membership.setPointsBalance(0);
            membership.setTotalLifetimeSpend(java.math.BigDecimal.ZERO);
        }
        
        membership.setTier(newTier.toUpperCase());
        rewardsProfileRepository.save(membership);
        
        return ResponseEntity.ok(Map.of("message", "Membership tier updated to " + newTier));
    }
}
