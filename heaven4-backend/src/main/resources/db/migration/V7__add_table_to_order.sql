-- Add table_number to orders table to support POS integration
ALTER TABLE orders ADD COLUMN table_number VARCHAR(20);

-- Index the table_number for quick employee queries
CREATE INDEX idx_orders_table_number ON orders(table_number);
