package com.heaven4.domain.catalog.repository;

import com.heaven4.domain.catalog.entity.Modifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModifierRepository extends JpaRepository<Modifier, Long> {
    List<Modifier> findByGroupIdOrderBySortOrderAsc(Long groupId);
}
