package com.heaven4.domain.events.repository;

import com.heaven4.domain.events.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByEventTypeOrderByStartDateAsc(String eventType);
    Optional<Event> findByPrivateInviteToken(String privateInviteToken);
    List<Event> findByStatus(String status);
}
