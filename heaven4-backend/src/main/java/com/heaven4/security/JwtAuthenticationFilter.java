package com.heaven4.security;

import com.heaven4.core.HeavenConstants;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT authentication filter.
 *
 * <p>Intercepts every request, extracts the Bearer token from the Authorization header,
 * validates it, and sets the SecurityContext for the duration of the request.
 *
 * <p>Runs once per request (OncePerRequestFilter).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(HeavenConstants.JWT_HEADER_NAME);

        if (authHeader == null || !authHeader.startsWith(HeavenConstants.JWT_TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(HeavenConstants.JWT_TOKEN_PREFIX.length());

        try {
            if (jwtProvider.isTokenValid(token) &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                Long userId = jwtProvider.extractUserId(token);
                String role = jwtProvider.extractRole(token);
                String workspace = jwtProvider.extractWorkspace(token);

                HeavenUserDetails userDetails = HeavenUserDetails.builder()
                        .userId(userId)
                        .role(role)
                        .workspace(workspace)
                        .build();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)));

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Authenticated user [{}] with role [{}] for workspace [{}]",
                        userId, role, workspace);
            }
        } catch (JwtException ex) {
            log.warn("JWT authentication failed for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            // Don't set authentication — Spring Security will handle the 401
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/api/v1/auth/");
    }
}
