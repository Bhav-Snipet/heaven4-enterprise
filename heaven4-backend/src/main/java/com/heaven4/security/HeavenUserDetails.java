package com.heaven4.security;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Heaven4 authenticated user principal stored in SecurityContext.
 *
 * <p>Contains userId, role, and workspace — everything needed for
 * workspace-aware permission checks throughout the application.
 */
@Getter
@Builder
public class HeavenUserDetails implements UserDetails {

    private final Long userId;
    private final String role;
    private final String workspace;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return null; // JWT-based — no password stored in principal
    }

    @Override
    public String getUsername() {
        return String.valueOf(userId);
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
