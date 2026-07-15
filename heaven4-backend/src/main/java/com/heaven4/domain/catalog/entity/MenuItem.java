package com.heaven4.domain.catalog.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items", indexes = {
    @Index(name = "idx_menu_items_category", columnList = "category_id")
})
@Getter
@Setter
public class MenuItem extends BaseEntity {

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Boolean isVeg = false;

    @Column(nullable = false)
    private Integer spicinessLevel = 0;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
