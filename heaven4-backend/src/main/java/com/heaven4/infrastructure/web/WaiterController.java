package com.heaven4.infrastructure.web;

import com.heaven4.domain.orders.entity.WaiterCall;
import com.heaven4.domain.orders.repository.WaiterCallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterCallRepository waiterCallRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/call/{tableNo}")
    public ResponseEntity<WaiterCall> callWaiter(
            @PathVariable String tableNo,
            @RequestBody Map<String, String> body) {
        String requestType = body.getOrDefault("type", "Assistance");

        WaiterCall call = new WaiterCall();
        call.setTableNumber(tableNo);
        call.setRequestType(requestType);
        call.setStatus("PENDING");
        call.setCreatedAt(ZonedDateTime.now());
        
        WaiterCall savedCall = waiterCallRepository.save(call);

        // Broadcast realtime WebSocket alert
        messagingTemplate.convertAndSend("/topic/operations", Map.of(
                "type", "WAITER_CALL",
                "callId", savedCall.getId(),
                "tableNumber", tableNo,
                "reason", requestType,
                "timestamp", savedCall.getCreatedAt().toString()
        ));

        return ResponseEntity.ok(savedCall);
    }

    @GetMapping("/calls")
    public ResponseEntity<List<WaiterCall>> getActiveCalls() {
        return ResponseEntity.ok(waiterCallRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
    }

    @PostMapping("/call/{id}/attend")
    public ResponseEntity<WaiterCall> attendCall(
            @PathVariable Long id,
            Principal principal) {
        WaiterCall call = waiterCallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Call not found"));

        call.setStatus("ATTENDED");
        call.setAttendedAt(ZonedDateTime.now());
        if (principal != null) {
            call.setAttendedBy(principal.getName());
        }

        WaiterCall savedCall = waiterCallRepository.save(call);

        // Broadcast clear event
        messagingTemplate.convertAndSend("/topic/operations", Map.of(
                "type", "WAITER_CALL_RESOLVED",
                "callId", savedCall.getId(),
                "tableNumber", savedCall.getTableNumber()
        ));

        return ResponseEntity.ok(savedCall);
    }
}
