package com.heaven4.domain.orders.repository;

import com.heaven4.domain.orders.entity.Order;
import com.heaven4.domain.orders.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
