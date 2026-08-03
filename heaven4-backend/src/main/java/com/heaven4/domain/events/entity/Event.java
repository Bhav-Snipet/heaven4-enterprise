package com.heaven4.domain.events.entity;

import com.heaven4.core.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
public class Event extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_type", nullable = false)
    private String eventType = "PUBLIC"; // PUBLIC or PRIVATE

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String location = "Rooftop Sunset Lounge";

    @Column(name = "private_invite_token", unique = true)
    private String privateInviteToken;

    @Column(name = "ticket_price", precision = 10, scale = 2)
    private BigDecimal ticketPrice = BigDecimal.ZERO;

    @Column(name = "total_passes")
    private Integer totalPasses = 100;

    @Column(name = "available_passes")
    private Integer availablePasses = 100;

    @Column(name = "dj_name")
    private String djName;

    @Column(name = "dj_genre")
    private String djGenre;

    @Column(name = "assigned_manager")
    private String assignedManager = "Sarah Jenkins";

    @Column(name = "assigned_chef")
    private String assignedChef = "Marco Polo";

    @Column(name = "assigned_employee")
    private String assignedEmployee = "Alex Rivera";

    @Column(nullable = false)
    private String status = "UPCOMING"; // UPCOMING, LIVE, COMPLETED, CANCELLED

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventMenuItem> menuItems = new ArrayList<>();

    public Event() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPrivateInviteToken() { return privateInviteToken; }
    public void setPrivateInviteToken(String privateInviteToken) { this.privateInviteToken = privateInviteToken; }

    public BigDecimal getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

    public Integer getTotalPasses() { return totalPasses; }
    public void setTotalPasses(Integer totalPasses) { this.totalPasses = totalPasses; }

    public Integer getAvailablePasses() { return availablePasses; }
    public void setAvailablePasses(Integer availablePasses) { this.availablePasses = availablePasses; }

    public String getDjName() { return djName; }
    public void setDjName(String djName) { this.djName = djName; }

    public String getDjGenre() { return djGenre; }
    public void setDjGenre(String djGenre) { this.djGenre = djGenre; }

    public String getAssignedManager() { return assignedManager; }
    public void setAssignedManager(String assignedManager) { this.assignedManager = assignedManager; }

    public String getAssignedChef() { return assignedChef; }
    public void setAssignedChef(String assignedChef) { this.assignedChef = assignedChef; }

    public String getAssignedEmployee() { return assignedEmployee; }
    public void setAssignedEmployee(String assignedEmployee) { this.assignedEmployee = assignedEmployee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<EventMenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<EventMenuItem> menuItems) { this.menuItems = menuItems; }

    public void addMenuItem(EventMenuItem item) {
        menuItems.add(item);
        item.setEvent(this);
    }
}
