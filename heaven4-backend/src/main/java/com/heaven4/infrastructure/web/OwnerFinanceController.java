package com.heaven4.infrastructure.web;

import com.heaven4.engines.finance.FinanceEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/finance")
@RequiredArgsConstructor
public class OwnerFinanceController {

    private final FinanceEngine financeEngine;

    @GetMapping("/daily-summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getDailySummary() {
        return ResponseEntity.ok(financeEngine.getDailySummary());
    }
}
