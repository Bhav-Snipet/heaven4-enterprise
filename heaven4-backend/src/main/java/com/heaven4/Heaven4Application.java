package com.heaven4;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Heaven4 Enterprise — Intelligent Restaurant Operations Platform
 *
 * <p>Entry point for the Spring Boot application.
 *
 * <p>Enabled capabilities:
 * <ul>
 *   <li>JPA Auditing — auto-populate createdAt, updatedAt, createdBy, updatedBy</li>
 *   <li>Async — non-blocking event publishing and notifications</li>
 *   <li>Scheduling — Automation Engine background jobs (point expiry, reports, etc.)</li>
 * </ul>
 */
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "heavenAuditorAware")
@EnableAsync
@EnableScheduling
public class Heaven4Application {

    public static void main(String[] args) {
        SpringApplication.run(Heaven4Application.class, args);
    }
}
