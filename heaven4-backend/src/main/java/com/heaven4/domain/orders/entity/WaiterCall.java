package com.heaven4.domain.orders.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.ZonedDateTime;

@Entity
@Table(name = "waiter_calls")
@Getter
@Setter
public class WaiterCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false)
    private String tableNumber;

    @Column(name = "request_type", nullable = false)
    private String requestType;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ATTENDED

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "attended_at")
    private ZonedDateTime attendedAt;

    @Column(name = "attended_by")
    private String attendedBy;
}
