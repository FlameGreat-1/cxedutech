-- Add level and pack_type to products for the new scaling architecture

ALTER TABLE products
ADD COLUMN IF NOT EXISTS level VARCHAR(50),
ADD COLUMN IF NOT EXISTS pack_type VARCHAR(50);

-- Update existing records to have a default pack_type if null
UPDATE products SET pack_type = 'Standard' WHERE pack_type IS NULL;
