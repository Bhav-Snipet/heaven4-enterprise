package com.heaven4.infrastructure.web;

import com.heaven4.domain.catalog.entity.Category;
import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.engines.catalog.CatalogEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogEngine catalogEngine;

    // --- PUBLIC ENDPOINTS (Customer, Kiosk, etc) ---

    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> getFullCatalog(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(catalogEngine.getFullCatalog(branchId));
    }

    // --- PROTECTED ENDPOINTS (Admin, Manager, Owner) ---

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(catalogEngine.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(catalogEngine.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        catalogEngine.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem item) {
        return ResponseEntity.ok(catalogEngine.createMenuItem(item));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem item) {
        return ResponseEntity.ok(catalogEngine.updateMenuItem(id, item));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        catalogEngine.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
