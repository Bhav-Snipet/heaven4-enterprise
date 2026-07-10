package com.heaven4.core;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Base entity for all Heaven4 domain entities.
 *
 * <p>Provides:
 * <ul>
 *   <li>Auto-generated UUID primary key</li>
 *   <li>JPA auditing (createdAt, updatedAt, createdBy, updatedBy)</li>
 *   <li>Soft delete support (deletedAt)</li>
 *   <li>Optimistic locking (version)</li>
 * </ul>
 *
 * <p>Every entity in Heaven4 must extend this class.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false, length = 100)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    /**
     * Performs a soft delete by setting the deletedAt timestamp.
     * Does not remove the record from the database.
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    /**
     * Returns true if this entity has been soft-deleted.
     */
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
