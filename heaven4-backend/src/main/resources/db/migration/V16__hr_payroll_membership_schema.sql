-- =====================================================
-- Heaven4 Enterprise — V16: HR, Payroll, and Teams
-- =====================================================

-- ===== TEAMS =====
CREATE TABLE teams (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL, -- e.g., 'Morning Shift'
    description     VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Mapping Users to Teams
CREATE TABLE user_teams (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id         BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- ===== ATTENDANCE =====
CREATE TABLE attendance (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    clock_in        TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out       TIMESTAMP WITH TIME ZONE,
    shift_type      VARCHAR(20) DEFAULT 'FULL', -- FULL, HALF, OVERTIME
    hours_worked    NUMERIC(5,2),
    notes           VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===== PAYROLL =====
CREATE TABLE payroll (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    base_salary     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    bonus_amount    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    deductions      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_pay         NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID
    paid_at         TIMESTAMP WITH TIME ZONE,
    reason          TEXT, -- for bonuses/deductions
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ===== ADD PASSWORD/DOB TO USERS =====
-- In V2 users lacked password and DOB for gamified profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
