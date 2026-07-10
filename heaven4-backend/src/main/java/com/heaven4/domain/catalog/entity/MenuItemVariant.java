package com.heaven4.domain.catalog.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_item_variants")
@Getter
@Setter
public class MenuItemVariant extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private BigDecimal priceAdjustment = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean isAvailable = true;
}
