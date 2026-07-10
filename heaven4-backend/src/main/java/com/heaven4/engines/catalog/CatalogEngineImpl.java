package com.heaven4.engines.catalog;

import com.heaven4.domain.catalog.entity.Category;
import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.domain.catalog.entity.MenuItemVariant;
import com.heaven4.domain.catalog.entity.Modifier;
import com.heaven4.domain.catalog.entity.ModifierGroup;
import com.heaven4.domain.catalog.repository.CategoryRepository;
import com.heaven4.domain.catalog.repository.MenuItemRepository;
import com.heaven4.domain.catalog.repository.MenuItemVariantRepository;
import com.heaven4.domain.catalog.repository.ModifierGroupRepository;
import com.heaven4.domain.catalog.repository.ModifierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogEngineImpl implements CatalogEngine {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemVariantRepository variantRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final ModifierRepository modifierRepository;

    @Override
    @Transactional
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, Category category) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setSortOrder(category.getSortOrder());
        existing.setIsActive(category.getIsActive());
        existing.setImageUrl(category.getImageUrl());
        return categoryRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<Category> getCategories(Long branchId) {
        return categoryRepository.findByBranchIdOrderBySortOrderAsc(branchId);
    }

    @Override
    @Transactional
    public MenuItem createMenuItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    @Override
    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItem item) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));
        existing.setName(item.getName());
        existing.setDescription(item.getDescription());
        existing.setBasePrice(item.getBasePrice());
        existing.setIsAvailable(item.getIsAvailable());
        existing.setIsVeg(item.getIsVeg());
        existing.setSpicinessLevel(item.getSpicinessLevel());
        existing.setImageUrl(item.getImageUrl());
        existing.setSortOrder(item.getSortOrder());
        return menuItemRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    @Override
    public List<MenuItem> getMenuItemsByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryIdOrderBySortOrderAsc(categoryId);
    }

    @Override
    @Transactional
    public MenuItemVariant addVariantToItem(Long itemId, MenuItemVariant variant) {
        variant.setItemId(itemId);
        return variantRepository.save(variant);
    }

    @Override
    @Transactional
    public ModifierGroup createModifierGroup(ModifierGroup group) {
        return modifierGroupRepository.save(group);
    }

    @Override
    @Transactional
    public Modifier addModifierToGroup(Long groupId, Modifier modifier) {
        modifier.setGroupId(groupId);
        return modifierRepository.save(modifier);
    }

    @Override
    public Map<String, Object> getFullCatalog(Long branchId) {
        Map<String, Object> catalog = new HashMap<>();
        
        List<Category> categories = categoryRepository.findByBranchIdOrderBySortOrderAsc(branchId);
        catalog.put("categories", categories);
        
        Map<Long, List<MenuItem>> itemsByCategory = new HashMap<>();
        for (Category cat : categories) {
            itemsByCategory.put(cat.getId(), menuItemRepository.findByCategoryIdOrderBySortOrderAsc(cat.getId()));
        }
        catalog.put("items", itemsByCategory);
        
        return catalog;
    }
}
