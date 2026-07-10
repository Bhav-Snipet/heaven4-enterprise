package com.heaven4.engines.recommendation;

import java.util.List;

/**
 * Recommendation Engine — suggests menu items, offers, membership upgrades,
 * reward redemptions, and promotions based on customer behavior.
 */
public interface RecommendationEngine {

    /** Returns recommended menu items for a customer based on order history. */
    List<?> getMenuRecommendations(Long customerId, Long branchId, int limit);

    /** Returns recommended offers/promotions for a customer. */
    List<?> getOfferRecommendations(Long customerId);

    /** Returns popular items ("Trending Now") for a branch. */
    List<?> getTrendingItems(Long branchId, int limit);

    /** Returns "People also ordered" suggestions for a specific menu item. */
    List<?> getRelatedItems(Long menuItemId, int limit);

    /** Returns a membership upgrade suggestion if the customer is close to the next tier. */
    java.util.Map<String, Object> getMembershipSuggestion(Long customerId);
}
