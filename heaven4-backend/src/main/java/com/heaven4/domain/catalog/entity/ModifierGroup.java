package com.heaven4.domain.catalog.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "menu_modifier_groups")
@Getter
@Setter
public class ModifierGroup extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String description;

    @Column(nullable = false)
    private Boolean isRequired = false;

    @Column(nullable = false)
    private Integer minSelections = 0;

    @Column(nullable = false)
    private Integer maxSelections = 1;

    private Long branchId;
}
