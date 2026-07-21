-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT,
    order_id BIGINT,
    type VARCHAR(100) NOT NULL DEFAULT 'OTHER',
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    resolved_by VARCHAR(100),
    resolution_note VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0
);
