package com.heaven4.infrastructure.web;

import com.heaven4.domain.identity.entity.Payroll;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.repository.PayrollRepository;
import com.heaven4.domain.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollRepository payrollRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Payroll>> getAllPayroll() {
        return ResponseEntity.ok(payrollRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Payroll> createPayroll(@RequestBody Map<String, Object> req) {
        Long userId = Long.valueOf(req.get("userId").toString());
        User user = userRepository.findById(userId).orElseThrow();
        
        Payroll payroll = new Payroll();
        payroll.setUser(user);
        payroll.setPeriodStart(LocalDate.parse(req.get("periodStart").toString()));
        payroll.setPeriodEnd(LocalDate.parse(req.get("periodEnd").toString()));
        payroll.setBaseSalary(new BigDecimal(req.get("baseSalary").toString()));
        
        if (req.containsKey("bonusAmount")) payroll.setBonusAmount(new BigDecimal(req.get("bonusAmount").toString()));
        if (req.containsKey("deductions")) payroll.setDeductions(new BigDecimal(req.get("deductions").toString()));
        
        payroll.setNetPay(payroll.getBaseSalary().add(payroll.getBonusAmount()).subtract(payroll.getDeductions()));
        if (req.containsKey("reason")) payroll.setReason(req.get("reason").toString());
        
        return ResponseEntity.ok(payrollRepository.save(payroll));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Payroll> markAsPaid(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> req) {
        Payroll payroll = payrollRepository.findById(id).orElseThrow();
        
        if (req.containsKey("bonusAmount")) {
            payroll.setBonusAmount(new BigDecimal(req.get("bonusAmount").toString()));
        }
        if (req.containsKey("deductions")) {
            payroll.setDeductions(new BigDecimal(req.get("deductions").toString()));
        }
        if (req.containsKey("reason")) {
            payroll.setReason(req.get("reason").toString());
        }
        
        payroll.setNetPay(payroll.getBaseSalary().add(payroll.getBonusAmount()).subtract(payroll.getDeductions()));
        payroll.setStatus("PAID");
        payroll.setPaidAt(ZonedDateTime.now());
        
        return ResponseEntity.ok(payrollRepository.save(payroll));
    }
}
