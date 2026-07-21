package com.heaven4.domain.identity.repository;

import com.heaven4.domain.identity.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserId(Long userId);
    List<Attendance> findByDate(LocalDate date);
    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);
}
