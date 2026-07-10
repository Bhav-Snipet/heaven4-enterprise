package com.heaven4.infrastructure;

import com.heaven4.core.HeavenConstants;
import com.heaven4.security.HeavenUserDetails;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * JPA Auditing provider for Heaven4.
 *
 * <p>Supplies the current user identifier for {@code @CreatedBy} and {@code @LastModifiedBy}
 * fields in all entities extending {@link com.heaven4.core.BaseEntity}.
 *
 * <p>Returns the user ID from SecurityContext, or "SYSTEM" for background jobs.
 */
@Component("heavenAuditorAware")
public class HeavenAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.of(HeavenConstants.SYSTEM_USER);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof HeavenUserDetails userDetails) {
            return Optional.of(String.valueOf(userDetails.getUserId()));
        }

        return Optional.of(HeavenConstants.SYSTEM_USER);
    }
}
