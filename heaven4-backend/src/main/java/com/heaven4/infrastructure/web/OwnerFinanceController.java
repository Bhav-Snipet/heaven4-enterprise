package com.heaven4.infrastructure.web;

import com.heaven4.engines.finance.FinanceEngine;
import com.heaven4.engines.finance.ReportEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/finance")
@RequiredArgsConstructor
public class OwnerFinanceController {

    private final FinanceEngine financeEngine;
    private final ReportEngine reportEngine;

    @GetMapping("/daily-summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getDailySummary() {
        return ResponseEntity.ok(financeEngine.getDailySummary());
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<java.util.List<String>> listReports() {
        return ResponseEntity.ok(reportEngine.listHistoricalReports());
    }

    @PostMapping("/reports/generate")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, String>> generateReportNow() {
        reportEngine.generateEncryptedDailyReport();
        return ResponseEntity.ok(Map.of("message", "Report generated successfully"));
    }

    @GetMapping("/reports/download/{filename}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> downloadReport(@org.springframework.web.bind.annotation.PathVariable String filename) {
        byte[] data = reportEngine.downloadEncryptedReport(filename);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .body(data);
    }
}
