package com.heaven4.domain.complaints.repository;

import com.heaven4.domain.complaints.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCustomerId(Long customerId);
}
