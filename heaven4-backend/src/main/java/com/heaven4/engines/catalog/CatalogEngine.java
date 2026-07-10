package com.heaven4.engines.catalog;

import com.heaven4.domain.catalog.entity.Category;
import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.domain.catalog.entity.MenuItemVariant;
import com.heaven4.domain.catalog.entity.Modifier;
import com.heaven4.domain.catalog.entity.ModifierGroup;

import java.util.List;
import java.util.Map;

public interface CatalogEngine {
    
    // Category Management
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    List<Category> getCategories(Long branchId);

    // Menu Item Management
    MenuItem createMenuItem(MenuItem item);
    MenuItem updateMenuItem(Long id, MenuItem item);
    void deleteMenuItem(Long id);
    List<MenuItem> getMenuItemsByCategory(Long categoryId);

    // Variants and Modifiers (simplified for Phase 4)
    MenuItemVariant addVariantToItem(Long itemId, MenuItemVariant variant);
    ModifierGroup createModifierGroup(ModifierGroup group);
    Modifier addModifierToGroup(Long groupId, Modifier modifier);
    
    // Aggregated Fetching
    Map<String, Object> getFullCatalog(Long branchId);
}
