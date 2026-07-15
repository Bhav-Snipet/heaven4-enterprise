package com.heaven4.domain.orders.repository;

import com.heaven4.domain.orders.entity.Order;
import com.heaven4.domain.orders.entity.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @EntityGraph(attributePaths = {"items", "items.menuItem", "customer"})
    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    @EntityGraph(attributePaths = {"items", "items.menuItem"})
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {"items", "items.menuItem", "customer"})
    List<Order> findByStatusIn(List<OrderStatus> statuses);
}
