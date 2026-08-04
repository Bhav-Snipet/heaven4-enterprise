-- V25: Add Events, Event Menu Items, and Event Pass Bookings Schema for PostgreSQL

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP NOT NULL DEFAULT NOW(),
    location VARCHAR(255) NOT NULL DEFAULT 'Rooftop Sunset Lounge',
    private_invite_token VARCHAR(100) UNIQUE,
    ticket_price NUMERIC(10, 2) DEFAULT 0.00,
    total_passes INT DEFAULT 100,
    available_passes INT DEFAULT 100,
    dj_name VARCHAR(255),
    dj_genre VARCHAR(255),
    assigned_manager VARCHAR(255) DEFAULT 'Sarah Jenkins',
    assigned_chef VARCHAR(255) DEFAULT 'Marco Polo',
    assigned_employee VARCHAR(255) DEFAULT 'Alex Rivera',
    status VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_menu_items (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category_name VARCHAR(100) NOT NULL DEFAULT 'Event Specials',
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_pass_bookings (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    pass_code VARCHAR(100) NOT NULL UNIQUE,
    number_of_passes INT NOT NULL DEFAULT 1,
    table_number VARCHAR(50),
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    booked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

-- Seed initial default event
INSERT INTO events (title, description, event_type, start_date, end_date, location, ticket_price, total_passes, available_passes, dj_name, dj_genre, status, image_url)
VALUES (
    'Retro 90s Rooftop Vinyl Party',
    'Exclusive rooftop vinyl experience featuring hand-crafted retro cocktails and gourmet sliders.',
    'PUBLIC',
    NOW(),
    NOW(),
    'Skyline Rooftop Lounge',
    25.00,
    100,
    94,
    'DJ Groove Master',
    'Retro House & Disco',
    'UPCOMING',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'
);
