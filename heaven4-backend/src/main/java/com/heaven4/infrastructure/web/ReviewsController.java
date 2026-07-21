package com.heaven4.infrastructure.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@Slf4j
public class ReviewsController {

    @PostMapping
    public ResponseEntity<String> submitReview(@RequestBody Map<String, Object> body) {
        log.info("Received review for order {}: {} stars - {}", 
            body.get("orderId"), body.get("rating"), body.get("comment"));
        return ResponseEntity.ok("Review submitted successfully");
    }
}
