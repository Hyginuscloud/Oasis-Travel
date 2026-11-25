-- Oasis Travel and Tourism Consultancy Dubai
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Setup
-- Run this script once in your Supabase SQL Editor before deploying to Vercel.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authorized_admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  added_by TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  nationality TEXT NOT NULL,
  country_of_residence TEXT NOT NULL,
  service_required TEXT NOT NULL,
  destination TEXT NOT NULL,
  preferred_travel_date TEXT NOT NULL,
  number_of_travellers INTEGER NOT NULL DEFAULT 1,
  budget_range TEXT,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  email_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  short_description TEXT NOT NULL,
  highlights TEXT NOT NULL,
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_duration TEXT NOT NULL,
  inclusions TEXT NOT NULL,
  price_note TEXT NOT NULL DEFAULT 'Custom quotation upon enquiry',
  availability_status TEXT NOT NULL DEFAULT 'Available for Custom Quote',
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  items TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  media_url TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Safe upgrade if services table was created earlier without media_type / media_url
ALTER TABLE services ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';
ALTER TABLE services ADD COLUMN IF NOT EXISTS media_url TEXT;

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  author_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  service_used TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  experience_summary TEXT NOT NULL,
  is_sample_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
  verified_link TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS design_projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT TRUE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS special_offers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Special Offer',
  description TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT TRUE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  added_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) so PostgREST anon keys cannot directly read PII tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

