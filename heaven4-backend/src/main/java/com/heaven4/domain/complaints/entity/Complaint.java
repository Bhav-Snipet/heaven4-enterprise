package com.heaven4.domain.complaints.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "complaints")
@Getter
@Setter
public class Complaint extends BaseEntity {

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(nullable = false, length = 100)
    private String type = "OTHER";

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, IN_REVIEW, RESOLVED

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    @Column(name = "resolution_note", length = 2000)
    private String resolutionNote;
}
