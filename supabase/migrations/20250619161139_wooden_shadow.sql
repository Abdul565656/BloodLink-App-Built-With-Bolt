/*
  # Create donors table with RLS policies

  1. New Tables
    - `donors`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `phone_number` (text, required)
      - `city` (text, required)
      - `blood_group` (text, required)
      - `last_donation_date` (date, optional)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp, default now)

  2. Security
    - Enable RLS on `donors` table
    - Add policies for anonymous registration, authenticated read/update access

  3. Performance
    - Add indexes on blood_group, city, and is_available columns
*/

-- Create the donors table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors (blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_city ON donors (city);
CREATE INDEX IF NOT EXISTS idx_donors_available ON donors (is_available);

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can register as a donor" ON donors;
  DROP POLICY IF EXISTS "Authenticated users can read all donors" ON donors;
  DROP POLICY IF EXISTS "Authenticated users can update donor profiles" ON donors;
END $$;

-- RLS Policies
-- Allow anyone (including anonymous users) to register as a donor
CREATE POLICY "Anyone can register as a donor"
  ON donors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all donor information
CREATE POLICY "Authenticated users can read all donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update donor profiles
CREATE POLICY "Authenticated users can update donor profiles"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);