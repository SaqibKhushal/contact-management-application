package com.contactmanagement.backend.security;

import com.contactmanagement.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * JWT Authentication Filter
 * Intercepts every request to validate JWT token and set authentication context
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    // Using 'log' instead of 'logger' to avoid conflict with parent class field
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip JWT check for auth endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/")) {
            log.debug("Skipping JWT authentication for auth endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Check if Authorization header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Authorization header found for: {} {}", request.getMethod(), requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token (remove "Bearer " prefix)
        jwt = authHeader.substring(7);
        
        try {
            // Extract username from JWT
            username = jwtUtil.extractUsername(jwt);
            log.debug("JWT token found for user: {}", username);

            // If username is valid and no authentication exists in context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Load user from database
                var user = userRepository.findByEmail(username)
                        .orElseGet(() -> userRepository.findByPhoneNumber(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

                // Validate token
                if (jwtUtil.validateToken(jwt, username)) {
                    // Create UserDetails (Spring Security requirement)
                    UserDetails userDetails = org.springframework.security.core.userdetails.User
                            .withUsername(username)
                            .password(user.getPassword())
                            .authorities(new ArrayList<>())
                            .build();

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set successfully for user: {}", username);
                } else {
                    log.warn("JWT token validation failed for user: {}", username);
                }
            }
        } catch (io.jsonwebtoken.JwtException e) {
            log.error("JWT validation failed: {}", e.getMessage());
            // Don't set authentication - request will be treated as unauthenticated
        } catch (UsernameNotFoundException e) {
            log.error("User not found: {}", e.getMessage());
            // Don't set authentication - request will be treated as unauthenticated
        } catch (Exception e) {
            log.error("Unexpected error during JWT authentication: {}", e.getMessage());
            // Don't set authentication - request will be treated as unauthenticated
        }

        filterChain.doFilter(request, response);
    }
}
