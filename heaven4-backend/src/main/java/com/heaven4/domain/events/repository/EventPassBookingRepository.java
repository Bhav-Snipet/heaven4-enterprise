package com.heaven4.domain.events.repository;

import com.heaven4.domain.events.entity.EventPassBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventPassBookingRepository extends JpaRepository<EventPassBooking, Long> {
    List<EventPassBooking> findByCustomerPhoneOrderByBookedAtDesc(String customerPhone);
    Optional<EventPassBooking> findByPassCode(String passCode);
    List<EventPassBooking> findByEventId(Long eventId);
}
