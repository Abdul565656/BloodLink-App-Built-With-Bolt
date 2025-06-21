/*
  # Add country field to donors and blood_requests tables

  1. Changes
    - Add `country` column to `donors` table
    - Add `country` column to `blood_requests` table
    - Update existing indexes to include country for better location-based queries
    - Add new indexes for country-based filtering

  2. Notes
    - Country will be stored as ISO 3166-1 alpha-2 country codes (e.g., 'US', 'CA', 'GB')
    - This enables worldwide location support with proper country/city hierarchy
    - Existing city data remains unchanged for backward compatibility
*/

-- Add country column to donors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'country'
  ) THEN
    ALTER TABLE donors ADD COLUMN country text;
  END IF;
END $$;

-- Add country column to blood_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blood_requests' AND column_name = 'country'
  ) THEN
    ALTER TABLE blood_requests ADD COLUMN country text;
  END IF;
END $$;

-- Create indexes for country-based queries
CREATE INDEX IF NOT EXISTS idx_donors_country ON donors (country);
CREATE INDEX IF NOT EXISTS idx_donors_country_city ON donors (country, city);
CREATE INDEX IF NOT EXISTS idx_donors_country_blood_group ON donors (country, blood_group);

CREATE INDEX IF NOT EXISTS idx_blood_requests_country ON blood_requests (country);
CREATE INDEX IF NOT EXISTS idx_blood_requests_country_city ON blood_requests (country, city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_country_blood_group ON blood_requests (country, blood_group);

-- Create composite indexes for optimal location-based donor matching
CREATE INDEX IF NOT EXISTS idx_donors_location_blood_available ON donors (country, city, blood_group, is_available);
CREATE INDEX IF NOT EXISTS idx_blood_requests_location_blood_status ON blood_requests (country, city, blood_group, status);