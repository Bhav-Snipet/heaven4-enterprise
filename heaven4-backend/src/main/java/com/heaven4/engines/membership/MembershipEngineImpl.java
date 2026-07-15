package com.heaven4.engines.membership;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.domain.billing.PointsHistory;
import com.heaven4.domain.billing.RewardsProfile;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.billing.repository.InvoiceRepository;
import com.heaven4.domain.billing.repository.RewardsProfileRepository;
import com.heaven4.domain.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MembershipEngineImpl implements MembershipEngine {

    private final RewardsProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    private RewardsProfile getOrCreateProfile(Long userId) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            RewardsProfile p = new RewardsProfile();
            p.setUser(user);
            return profileRepository.save(p);
        });
    }

    @Override
    @Transactional
    public void awardPoints(Long customerId, int points, String reason, Long invoiceId) {
        RewardsProfile profile = getOrCreateProfile(customerId);
        Invoice invoice = null;
        if (invoiceId != null) {
            invoice = invoiceRepository.findById(invoiceId).orElse(null);
            if (invoice != null) {
                profile.addLifetimeSpend(invoice.getTotalAmount());
            }
        }
        profile.addPoints(points, reason, invoice);
        profileRepository.save(profile);
    }

    @Override
    @Transactional
    public void redeemPoints(Long customerId, int points, Long invoiceId) {
        RewardsProfile profile = getOrCreateProfile(customerId);
        if (profile.getPointsBalance() < points) {
            throw new RuntimeException("Insufficient points");
        }
        Invoice invoice = invoiceId != null ? invoiceRepository.findById(invoiceId).orElse(null) : null;
        profile.deductPoints(points, "Redeemed for discount", invoice);
        profileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public int getPointBalance(Long customerId) {
        return profileRepository.findByUserId(customerId)
                .map(RewardsProfile::getPointsBalance)
                .orElse(0);
    }

    @Override
    @Transactional(readOnly = true)
    public String getCurrentTier(Long customerId) {
        return profileRepository.findByUserId(customerId)
                .map(RewardsProfile::getTier)
                .orElse("BRONZE");
    }

    @Override
    @Transactional
    public void evaluateTierStatus(Long customerId) {
        RewardsProfile profile = getOrCreateProfile(customerId);
        // addPoints implicitly updates tier based on lifetime spend
        profileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<?> getPointHistory(Long customerId, int page, int size) {
        RewardsProfile profile = profileRepository.findByUserId(customerId).orElse(null);
        if (profile == null) return List.of();
        return profile.getHistory(); // Note: for pagination we'd use a repository query, returning all for simplicity
    }

    @Override
    public void notifyExpiringPoints(int withinDays) {
        // Not implemented for Phase 6
    }

    @Override
    public void expirePoints() {
        // Not implemented for Phase 6
    }
}
