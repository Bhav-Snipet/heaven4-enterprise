package com.heaven4.domain.orders.repository;

import com.heaven4.domain.orders.entity.WaiterCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaiterCallRepository extends JpaRepository<WaiterCall, Long> {
    List<WaiterCall> findByStatusOrderByCreatedAtDesc(String status);
}
