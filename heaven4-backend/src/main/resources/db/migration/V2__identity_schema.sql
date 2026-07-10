-- =====================================================
-- Heaven4 Enterprise — V2: Identity Schema
-- =====================================================
-- Contains Users, Roles, and OTP Verification tables.

-- ===== USERS =====
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    phone_number    VARCHAR(20) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);

-- ===== USER ROLES =====
CREATE TABLE user_roles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL, -- CUSTOMER, EMPLOYEE, KITCHEN, MANAGER, ADMIN, OWNER
    workspace       VARCHAR(30) NOT NULL, -- Context for the role
    branch_id       BIGINT,               -- NULL means global/headquarters access
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    granted_by      VARCHAR(100) DEFAULT 'SYSTEM',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0,
    UNIQUE(user_id, role, workspace, branch_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_branch ON user_roles(branch_id);

-- ===== OTP VERIFICATIONS =====
CREATE TABLE otp_verifications (
    id              BIGSERIAL PRIMARY KEY,
    phone_number    VARCHAR(20) NOT NULL,
    otp_code        VARCHAR(10) NOT NULL,
    purpose         VARCHAR(30) NOT NULL DEFAULT 'LOGIN',
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts        INT NOT NULL DEFAULT 0,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number, is_verified);
