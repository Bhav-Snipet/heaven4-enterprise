package com.heaven4.domain.catalog.repository;

import com.heaven4.domain.catalog.entity.MenuItemVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemVariantRepository extends JpaRepository<MenuItemVariant, Long> {
    List<MenuItemVariant> findByItemId(Long itemId);
}
