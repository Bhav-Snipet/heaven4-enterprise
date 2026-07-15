package com.heaven4.domain.billing.repository;

import com.heaven4.domain.billing.RewardsProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardsProfileRepository extends JpaRepository<RewardsProfile, Long> {
    Optional<RewardsProfile> findByUserId(Long userId);
}
