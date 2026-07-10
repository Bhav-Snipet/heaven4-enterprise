-- =====================================================
-- Heaven4 Enterprise — V3: Catalog Schema
-- =====================================================
-- Contains Categories, Menu Items, Variants, and Modifiers.

-- ===== CATEGORIES =====
CREATE TABLE menu_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    branch_id       BIGINT, -- NULL for global
    image_url       VARCHAR(500),
    
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_menu_categories_branch ON menu_categories(branch_id);
CREATE INDEX idx_menu_categories_sort ON menu_categories(sort_order);

-- ===== MENU ITEMS =====
CREATE TABLE menu_items (
    id              BIGSERIAL PRIMARY KEY,
    category_id     BIGINT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     VARCHAR(1000),
    base_price      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    is_veg          BOOLEAN NOT NULL DEFAULT FALSE,
    spiciness_level INT NOT NULL DEFAULT 0,
    image_url       VARCHAR(500),
    sort_order      INT NOT NULL DEFAULT 0,
    
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order);

-- ===== MENU ITEM VARIANTS =====
-- E.g. Small, Medium, Large
CREATE TABLE menu_item_variants (
    id              BIGSERIAL PRIMARY KEY,
    item_id         BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_variants_item ON menu_item_variants(item_id);

-- ===== MODIFIER GROUPS =====
-- E.g. "Choose your Sauce", "Extra Toppings"
CREATE TABLE menu_modifier_groups (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(200),
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    min_selections  INT NOT NULL DEFAULT 0,
    max_selections  INT NOT NULL DEFAULT 1,
    branch_id       BIGINT,
    
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Mapping Items to Modifier Groups (Many to Many)
CREATE TABLE menu_item_modifier_groups (
    item_id         BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    group_id        BIGINT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
    sort_order      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id, group_id)
);

-- ===== MODIFIERS =====
-- E.g. "Ketchup", "Extra Cheese", "BBQ Sauce"
CREATE TABLE menu_modifiers (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    is_veg          BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT NOT NULL DEFAULT 0,
    
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by      VARCHAR(100) DEFAULT 'SYSTEM',
    deleted_at      TIMESTAMP WITH TIME ZONE,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_modifiers_group ON menu_modifiers(group_id);
