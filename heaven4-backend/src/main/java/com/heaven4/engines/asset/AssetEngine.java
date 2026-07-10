package com.heaven4.engines.asset;

import org.springframework.web.multipart.MultipartFile;

/**
 * Asset Engine — manages all media assets from one place.
 *
 * <p>Logo, QR codes, menu item images, videos, icons, themes, banners.
 */
public interface AssetEngine {

    /** Uploads an asset and returns the public URL. */
    String uploadAsset(MultipartFile file, String assetType, String category, Long referenceId);

    /** Returns the public URL for an asset. */
    String getAssetUrl(Long assetId);

    /** Deletes an asset. */
    void deleteAsset(Long assetId);

    /** Returns all assets for a given category. */
    java.util.List<?> getAssetsByCategory(String category, Long branchId);

    /** Generates a new QR code image for a table. */
    String generateTableQr(Long tableId, Long branchId);

    /** Updates the restaurant logo. */
    String updateLogo(MultipartFile logo, Long branchId);
}
