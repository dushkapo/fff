-- Diana Flowers Database Schema
-- Run this in Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS bouquets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  image_url TEXT,
  payment_url TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_open BOOLEAN DEFAULT true,
  delivery_enabled BOOLEAN DEFAULT true,
  -- Branding
  shop_name TEXT DEFAULT '',
  hero_title TEXT DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  telegram_link TEXT DEFAULT '',
  address TEXT DEFAULT '',
  address_link TEXT DEFAULT '',
  schedule TEXT DEFAULT '',
  -- Content toggle fields
  about_enabled BOOLEAN DEFAULT false,
  about_text TEXT DEFAULT '',
  schedule_enabled BOOLEAN DEFAULT false,
  delivery_price_enabled BOOLEAN DEFAULT false,
  delivery_price TEXT DEFAULT '',
  delivery_info TEXT DEFAULT '',
  pickup_info TEXT DEFAULT '',
  payment_info TEXT DEFAULT ''
);

-- Flowers table (for custom bouquet builder)
CREATE TABLE IF NOT EXISTS flowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price per stem
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default settings if not exists
INSERT INTO settings (shop_open, phone, telegram_link, schedule)
SELECT true, '+7 (999) 123-45-67', 'https://t.me/dianaflowers', 'Ежедневно с 9:00 до 21:00'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Insert sample bouquets
INSERT INTO bouquets (name, description, price, discount, image_url, in_stock) VALUES
('Королевская роза', 'Элегантная композиция из премиум роз Эквадор', 8500, 0, 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400&h=400&fit=crop', true),
('Весенняя нежность', 'Изысканный букет из белых пионов и эустомы', 12000, 15, 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&h=400&fit=crop', true),
('Летний сад', 'Яркая композиция из гортензий и роз', 9500, 0, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop', true),
('Бархатная ночь', 'Роскошные бордовые розы с декором', 15000, 20, 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=400&h=400&fit=crop', true);

-- Enable Row Level Security
ALTER TABLE bouquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for everyone (since we use custom admin auth on frontend)
-- WARNING: In a real production app with multiple users, you should use authenticated roles.
-- But for this simple single-admin setup, we allow the client to perform operations.
CREATE POLICY "Enable all access for bouquets" ON bouquets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for flowers" ON flowers
  FOR ALL USING (true) WITH CHECK (true);
