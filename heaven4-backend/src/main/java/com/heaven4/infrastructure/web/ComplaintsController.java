package com.heaven4.infrastructure.web;

import com.heaven4.domain.complaints.entity.Complaint;
import com.heaven4.domain.complaints.repository.ComplaintRepository;
import com.heaven4.security.HeavenUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintsController {

    private final ComplaintRepository complaintRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Complaint> raiseComplaint(
            @AuthenticationPrincipal HeavenUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        Complaint complaint = new Complaint();
        complaint.setCustomerId(userDetails.getUserId());
        complaint.setOrderId(body.get("orderId") != null ? Long.parseLong(body.get("orderId").toString()) : null);
        complaint.setType(body.getOrDefault("type", "OTHER").toString());
        complaint.setDescription(body.getOrDefault("description", "").toString());
        complaint.setStatus("OPEN");
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER', 'KITCHEN', 'EMPLOYEE')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER', 'EMPLOYEE')")
    public ResponseEntity<Complaint> resolveComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal HeavenUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("RESOLVED");
        complaint.setResolvedBy("User #" + userDetails.getUserId());
        complaint.setResolutionNote(body.getOrDefault("note", "Resolved by manager"));
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @PutMapping("/{id}/in-review")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Complaint> markInReview(@PathVariable Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("IN_REVIEW");
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }
}
