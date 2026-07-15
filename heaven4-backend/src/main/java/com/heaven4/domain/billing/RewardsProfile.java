package com.heaven4.domain.billing;

import com.heaven4.core.BaseEntity;
import com.heaven4.domain.identity.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rewards_profiles", indexes = {
    @Index(name = "idx_rewards_profiles_user", columnList = "user_id")
})
@Getter
@Setter
public class RewardsProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "points_balance", nullable = false)
    private Integer pointsBalance = 0;

    @Column(name = "tier", nullable = false, length = 30)
    private String tier = "BRONZE";

    @Column(name = "total_lifetime_spend", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalLifetimeSpend = BigDecimal.ZERO;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PointsHistory> history = new ArrayList<>();

    public void addPoints(Integer points, String reason, Invoice invoice) {
        this.pointsBalance += points;
        PointsHistory ph = new PointsHistory();
        ph.setProfile(this);
        ph.setPointsChange(points);
        ph.setReason(reason);
        ph.setInvoice(invoice);
        this.history.add(ph);
        updateTier();
    }

    public void deductPoints(Integer points, String reason, Invoice invoice) {
        this.pointsBalance -= points;
        PointsHistory ph = new PointsHistory();
        ph.setProfile(this);
        ph.setPointsChange(-points);
        ph.setReason(reason);
        ph.setInvoice(invoice);
        this.history.add(ph);
    }

    public void addLifetimeSpend(BigDecimal amount) {
        this.totalLifetimeSpend = this.totalLifetimeSpend.add(amount);
        updateTier();
    }

    private void updateTier() {
        if (totalLifetimeSpend.compareTo(new BigDecimal("1000")) >= 0) {
            this.tier = "GOLD";
        } else if (totalLifetimeSpend.compareTo(new BigDecimal("300")) >= 0) {
            this.tier = "SILVER";
        } else {
            this.tier = "BRONZE";
        }
    }
}
