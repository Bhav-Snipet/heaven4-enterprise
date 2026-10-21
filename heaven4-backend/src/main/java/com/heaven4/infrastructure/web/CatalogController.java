package com.heaven4.infrastructure.web;

import com.heaven4.domain.catalog.entity.Category;
import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.domain.catalog.repository.MenuItemRepository;
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
    private final MenuItemRepository menuItemRepository;

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

    @PutMapping("/items/{id}/image")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<MenuItem> updateItemImage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setImageUrl(body.get("imageUrl"));
        return ResponseEntity.ok(menuItemRepository.save(item));
    }

    private static volatile String activeMenuMode = "EVENT_PLUS_DEFAULT";

    @GetMapping("/mode")
    public ResponseEntity<Map<String, String>> getMenuMode() {
        return ResponseEntity.ok(Map.of("mode", activeMenuMode));
    }

    @PutMapping("/mode")
    public ResponseEntity<Map<String, String>> setMenuMode(@RequestBody Map<String, String> body) {
        String mode = body.getOrDefault("mode", "EVENT_PLUS_DEFAULT");
        if (!"DEFAULT".equalsIgnoreCase(mode) && !"EVENT_PLUS_DEFAULT".equalsIgnoreCase(mode)) {
            mode = "EVENT_PLUS_DEFAULT";
        }
        activeMenuMode = mode.toUpperCase();
        return ResponseEntity.ok(Map.of("mode", activeMenuMode, "message", "Menu mode updated to " + activeMenuMode));
    }
}
