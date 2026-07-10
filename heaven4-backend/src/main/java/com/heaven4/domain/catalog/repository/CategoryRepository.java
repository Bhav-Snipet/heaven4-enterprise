package com.heaven4.domain.catalog.repository;

import com.heaven4.domain.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByBranchIdOrderBySortOrderAsc(Long branchId);
}
