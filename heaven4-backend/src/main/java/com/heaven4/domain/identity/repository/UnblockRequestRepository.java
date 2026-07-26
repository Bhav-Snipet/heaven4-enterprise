package com.heaven4.domain.identity.repository;

import com.heaven4.domain.identity.entity.UnblockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnblockRequestRepository extends JpaRepository<UnblockRequest, Long> {
    List<UnblockRequest> findByStatus(String status);
    Optional<UnblockRequest> findTopByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
}
