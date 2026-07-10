-- =====================================================
-- Heaven4 Enterprise — V1: Platform Foundation Tables
-- =====================================================
-- These are the core platform tables that every domain depends on.
-- No business/restaurant tables here — those come in V2+.

-- ===== SYSTEM SETTINGS =====
CREATE TABLE system_settings (
    id              BIGSERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT NOT NULL,
    setting_type    VARCHAR(30) NOT NULL DEFAULT 'STRING',
    category        VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    description     VARCHAR(500),
    is_editable     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- ===== FEATURE REGISTRY =====
CREATE TABLE feature_registry (
    id              BIGSERIAL PRIMARY KEY,
    feature_id      VARCHAR(100) NOT NULL UNIQUE,
    feature_name    VARCHAR(200) NOT NULL,
    description     VARCHAR(500),
    category        VARCHAR(50) NOT NULL,
    is_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    workspace       VARCHAR(30),
    branch_id       BIGINT,
    role_required   VARCHAR(30),
    config_json     JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_feature_registry_feature_id ON feature_registry(feature_id);
CREATE INDEX idx_feature_registry_workspace ON feature_registry(workspace);
CREATE INDEX idx_feature_registry_category ON feature_registry(category);

-- ===== ASSET REGISTRY =====
CREATE TABLE asset_registry (
    id              BIGSERIAL PRIMARY KEY,
    asset_type      VARCHAR(50) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    public_url      VARCHAR(500),
    reference_id    BIGINT,
    reference_type  VARCHAR(50),
    branch_id       BIGINT,
    alt_text        VARCHAR(300),
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_asset_registry_type ON asset_registry(asset_type);
CREATE INDEX idx_asset_registry_category ON asset_registry(category);
CREATE INDEX idx_asset_registry_reference ON asset_registry(reference_type, reference_id);

-- ===== TIMELINE EVENTS =====
CREATE TABLE timeline_events (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT NOT NULL,
    action          VARCHAR(50) NOT NULL,
    description     VARCHAR(1000),
    performed_by    VARCHAR(100) NOT NULL,
    metadata        JSONB DEFAULT '{}',
    branch_id       BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_entity ON timeline_events(entity_type, entity_id);
CREATE INDEX idx_timeline_action ON timeline_events(action);
CREATE INDEX idx_timeline_created ON timeline_events(created_at DESC);
CREATE INDEX idx_timeline_branch ON timeline_events(branch_id);

-- ===== AUDIT LOGS =====
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT,
    performed_by    VARCHAR(100) NOT NULL,
    role            VARCHAR(30),
    workspace       VARCHAR(30),
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    old_value       JSONB,
    new_value       JSONB,
    description     VARCHAR(1000),
    branch_id       BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(performed_by);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ===== NOTIFICATIONS =====
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         VARCHAR(1000) NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    priority        VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    deep_link       VARCHAR(500),
    reference_id    BIGINT,
    reference_type  VARCHAR(50),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE,
    delivery_channel VARCHAR(30) DEFAULT 'IN_APP',
    branch_id       BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id, is_read);
CREATE INDEX idx_notification_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notification_category ON notifications(category);

-- ===== CONFIGURATION =====
CREATE TABLE configuration (
    id              BIGSERIAL PRIMARY KEY,
    config_key      VARCHAR(100) NOT NULL,
    config_value    TEXT NOT NULL,
    config_type     VARCHAR(30) NOT NULL DEFAULT 'STRING',
    domain          VARCHAR(50) NOT NULL,
    branch_id       BIGINT,
    description     VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0,
    UNIQUE(config_key, domain, branch_id)
);

CREATE INDEX idx_configuration_key ON configuration(config_key);
CREATE INDEX idx_configuration_domain ON configuration(domain);

-- ===== TASKS =====
CREATE TABLE tasks (
    id              BIGSERIAL PRIMARY KEY,
    task_type       VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    priority        VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    assigned_to     BIGINT,
    assigned_role   VARCHAR(30),
    reference_id    BIGINT,
    reference_type  VARCHAR(50),
    due_at          TIMESTAMP WITH TIME ZONE,
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    resolution      VARCHAR(500),
    escalated_to    BIGINT,
    escalation_reason VARCHAR(500),
    branch_id       BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_reference ON tasks(reference_type, reference_id);
CREATE INDEX idx_tasks_branch ON tasks(branch_id);
CREATE INDEX idx_tasks_due ON tasks(due_at) WHERE status IN ('PENDING', 'IN_PROGRESS');
