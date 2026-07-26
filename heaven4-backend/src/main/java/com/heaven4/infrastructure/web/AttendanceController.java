package com.heaven4.infrastructure.web;

import com.heaven4.domain.identity.entity.Attendance;
import com.heaven4.domain.identity.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        // Return all attendance for simplicity in the demo
        return ResponseEntity.ok(attendanceRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Attendance> logAttendance(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceRepository.save(attendance));
    }
}
