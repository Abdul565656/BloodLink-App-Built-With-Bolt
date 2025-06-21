/*
  # Create donors table for BloodLink

  1. New Tables
    - `donors`
      - `id` (uuid, primary key, auto-generated)
      - `full_name` (text, required)
      - `phone_number` (text, required)
      - `city` (text, required)
      - `blood_group` (text, required)
      - `last_donation_date` (date, optional)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp, auto-generated)

  2. Security
    - Enable RLS on `donors` table
    - Add policy for authenticated users to read all donor data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
*/

CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text NOT NULL,
  city text NOT NULL,
  blood_group text NOT NULL,
  last_donation_date date,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all donor data (for matching purposes)
CREATE POLICY "Authenticated users can read all donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to insert their own donor profile
CREATE POLICY "Users can insert their own donor profile"
  ON donors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow authenticated users to update their own donor profile
CREATE POLICY "Users can update their own donor profile"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Create an index on blood_group for faster matching queries
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);

-- Create an index on city for location-based matching
CREATE INDEX IF NOT EXISTS idx_donors_city ON donors(city);

-- Create an index on is_available for filtering available donors
CREATE INDEX IF NOT EXISTS idx_donors_available ON donors(is_available);