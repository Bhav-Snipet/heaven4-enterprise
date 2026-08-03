package com.heaven4.domain.events.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_pass_bookings")
public class EventPassBooking extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "pass_code", nullable = false, unique = true)
    private String passCode; // EVT-PASS-XXXX

    @Column(name = "number_of_passes", nullable = false)
    private Integer numberOfPasses = 1;

    @Column(name = "table_number")
    private String tableNumber;

    @Column(name = "total_paid", precision = 10, scale = 2)
    private BigDecimal totalPaid = BigDecimal.ZERO;

    @Column(name = "booked_at", nullable = false)
    private LocalDateTime bookedAt = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "BOOKED"; // BOOKED, ATTENDED, CANCELLED

    public EventPassBooking() {}

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPassCode() { return passCode; }
    public void setPassCode(String passCode) { this.passCode = passCode; }

    public Integer getNumberOfPasses() { return numberOfPasses; }
    public void setNumberOfPasses(Integer numberOfPasses) { this.numberOfPasses = numberOfPasses; }

    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }

    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
