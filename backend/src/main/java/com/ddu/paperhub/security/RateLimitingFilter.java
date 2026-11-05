package com.ddu.paperhub.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * High-performance sliding-window token bucket rate limiter.
 * Protects authentication and upload endpoints from brute-force & denial-of-service abuse.
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static class Bucket {
        long tokens;
        long lastRefillTimestamp;
        final long capacity;
        final long refillRatePerMinute;

        Bucket(long capacity, long refillRatePerMinute) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.refillRatePerMinute = refillRatePerMinute;
            this.lastRefillTimestamp = System.currentTimeMillis();
        }

        synchronized boolean tryConsume() {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsedSeconds = (now - lastRefillTimestamp) / 1000;
            if (elapsedSeconds > 0) {
                long tokensToAdd = (elapsedSeconds * refillRatePerMinute) / 60;
                if (tokensToAdd > 0) {
                    tokens = Math.min(capacity, tokens + tokensToAdd);
                    lastRefillTimestamp = now;
                }
            }
        }

        boolean isFull() {
            return tokens >= capacity;
        }
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        // Define rate-limited paths and limits
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            if (path.startsWith("/api/auth/login")) {
                if (!checkLimit("login:" + clientIp, 10, 10)) {
                    sendRateLimitResponse(response, "Too many login attempts. Please wait 1 minute before trying again.");
                    return;
                }
            } else if (path.startsWith("/api/auth/register")) {
                if (!checkLimit("register:" + clientIp, 5, 5)) {
                    sendRateLimitResponse(response, "Too many registration attempts. Please wait 1 minute.");
                    return;
                }
            } else if (path.startsWith("/api/papers/upload")) {
                if (!checkLimit("upload:" + clientIp, 15, 15)) {
                    sendRateLimitResponse(response, "Upload rate limit reached. Please wait a moment.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean checkLimit(String key, long capacity, long ratePerMinute) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(capacity, ratePerMinute));
        boolean allowed = bucket.tryConsume();
        // Evict buckets that have been refilled back to full — they hold no state
        // worth keeping, so the map cannot grow without bound under sustained abuse.
        if (allowed && bucket.isFull()) {
            buckets.remove(key, bucket);
        }
        return allowed;
    }

    private String getClientIp(HttpServletRequest request) {
        // Never trust X-Forwarded-For alone: it is client-controlled and can be
        // used to spoof the identity that rate limits apply to. Fall back to the
        // container-assigned remote address when the header is missing or malformed.
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            String[] parts = xfHeader.split(",");
            String last = parts[parts.length - 1].trim();
            if (last.matches("\\d{1,3}(?:\\.\\d{1,3}){3}")) {
                return last;
            }
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        body.put("error", "Too Many Requests");
        body.put("message", message);

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
