-- Add missing deleted_at column to complaints table (required by BaseEntity soft-delete)
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
