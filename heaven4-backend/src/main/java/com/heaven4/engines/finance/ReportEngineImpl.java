package com.heaven4.engines.finance;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.domain.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportEngineImpl implements ReportEngine {

    private final InvoiceRepository invoiceRepository;
    
    @Value("${heaven4.reports.dir:reports}")
    private String reportsDir;

    // In a real app, this should be in an environment variable
    private static final String AES_KEY = "12345678901234567890123456789012"; // 32 chars = 256 bits

    @Scheduled(cron = "0 0 23 * * ?") // Every day at 11 PM
    @Override
    public void generateEncryptedDailyReport() {
        log.info("Generating encrypted daily report");
        try {
            List<Invoice> invoices = invoiceRepository.findAll();
            StringBuilder csv = new StringBuilder();
            csv.append("ID,Order ID,Amount,Tip,Tax,Status,CreatedAt\n");
            
            for (Invoice inv : invoices) {
                csv.append(String.format("%d,%d,%s,%s,%s,%s,%s\n",
                        inv.getId(), inv.getOrder().getId(),
                        inv.getTotalAmount().toString(), inv.getTipAmount().toString(),
                        inv.getTaxAmount().toString(), inv.getStatus(),
                        inv.getCreatedAt().toString()
                ));
            }

            String dateStr = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
            String filename = "financial_report_" + dateStr + "_" + timestamp + ".enc";

            Path dirPath = Paths.get(reportsDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            byte[] encrypted = encrypt(csv.toString().getBytes(StandardCharsets.UTF_8), AES_KEY);
            Files.write(dirPath.resolve(filename), encrypted);
            log.info("Successfully generated report: {}", filename);
            
        } catch (Exception e) {
            log.error("Failed to generate encrypted report", e);
        }
    }

    @Override
    public List<String> listHistoricalReports() {
        try {
            Path dirPath = Paths.get(reportsDir);
            if (!Files.exists(dirPath)) return new ArrayList<>();
            return Files.list(dirPath)
                    .filter(p -> !Files.isDirectory(p) && p.toString().endsWith(".enc"))
                    .map(p -> p.getFileName().toString())
                    .sorted((a, b) -> b.compareTo(a)) // Sort descending by name
                    .collect(Collectors.toList());
        } catch (IOException e) {
            log.error("Error listing reports", e);
            return new ArrayList<>();
        }
    }

    @Override
    public byte[] downloadEncryptedReport(String filename) {
        try {
            Path filePath = Paths.get(reportsDir, filename);
            if (Files.exists(filePath)) {
                return Files.readAllBytes(filePath); // Returns raw encrypted bytes
            }
        } catch (IOException e) {
            log.error("Error downloading report", e);
        }
        return null;
    }

    private byte[] encrypt(byte[] data, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return cipher.doFinal(data);
    }
}
