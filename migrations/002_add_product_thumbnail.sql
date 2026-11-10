-- Migration 002: Add 16:9 thumbnail_url column to products table

IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('products')
      AND name = 'thumbnail_url'
)
BEGIN
    ALTER TABLE products ADD thumbnail_url NVARCHAR(1000) NULL;
END;

