package com.heaven4.domain.events.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.heaven4.core.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "event_menu_items")
public class EventMenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private Event event;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "category_name", nullable = false)
    private String categoryName = "Event Specials";

    @Column(name = "is_veg", nullable = false)
    private boolean isVeg = true;

    public EventMenuItem() {}

    public EventMenuItem(String name, String description, BigDecimal price, String categoryName, boolean isVeg) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryName = categoryName;
        this.isVeg = isVeg;
    }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public boolean isVeg() { return isVeg; }
    public void setVeg(boolean veg) { isVeg = veg; }
}
