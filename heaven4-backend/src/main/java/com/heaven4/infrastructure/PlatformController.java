package com.heaven4.infrastructure;

import com.heaven4.core.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Platform health and info endpoints (public, no authentication required).
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Platform", description = "Health and system information")
public class PlatformController {

    @Value("${info.app.name:Heaven4 Enterprise}")
    private String appName;

    @Value("${info.app.version:0.1.0}")
    private String appVersion;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns platform health status")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success("Platform is healthy", Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "application", appName,
                "version", appVersion
        ));
    }

    @GetMapping("/info")
    @Operation(summary = "Platform info", description = "Returns platform information")
    public ApiResponse<Map<String, Object>> info() {
        return ApiResponse.success("Platform information", Map.of(
                "application", appName,
                "version", appVersion,
                "environment", activeProfile,
                "java", System.getProperty("java.version"),
                "timestamp", Instant.now().toString()
        ));
    }
}
