package com.heaven4.infrastructure.web;

import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private String getCurrentUserPhone() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<User> getMyProfile() {
        String phone = getCurrentUserPhone();
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateMyProfile(@RequestBody Map<String, String> updates) {
        String phone = getCurrentUserPhone();
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("email")) {
            user.setEmail(updates.get("email"));
        }
        if (updates.containsKey("dateOfBirth")) {
            user.setDateOfBirth(LocalDate.parse(updates.get("dateOfBirth")));
        }
        if (updates.containsKey("password")) {
            user.setPasswordHash(passwordEncoder.encode(updates.get("password")));
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> softDeleteAccount() {
        String phone = getCurrentUserPhone();
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Soft delete: recoverable for 30 days
        user.setDeletedAt(Instant.now());
        user.setActive(false);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully. Recoverable for 30 days."));
    }
}
