/*
  # Create blood requests table

  1. New Tables
    - `blood_requests`
      - `id` (uuid, primary key)
      - `patient_name` (text, required)
      - `blood_group` (text, required)
      - `hospital_name` (text, required)
      - `city` (text, required)
      - `contact_number` (text, required)
      - `reason` (text, optional)
      - `urgency_level` (text, required)
      - `preferred_date` (date, required)
      - `preferred_time` (time, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `blood_requests` table
    - Add policy for anonymous users to submit blood requests
    - Add policy for authenticated users to read all blood requests

  3. Indexes
    - Index on blood_group for faster matching
    - Index on city for location-based queries
    - Index on urgency_level for priority sorting
    - Index on status for filtering active requests
*/

CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  blood_group text NOT NULL,
  hospital_name text NOT NULL,
  city text NOT NULL,
  contact_number text NOT NULL,
  reason text,
  urgency_level text NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high')),
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'fulfilled', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON blood_requests (blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_city ON blood_requests (city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON blood_requests (urgency_level);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests (status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_date ON blood_requests (preferred_date);

-- RLS Policies
-- Allow anyone (including anonymous users) to submit blood requests
CREATE POLICY "Anyone can submit blood requests"
  ON blood_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all blood requests
CREATE POLICY "Authenticated users can read all blood requests"
  ON blood_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update blood request status
CREATE POLICY "Authenticated users can update blood requests"
  ON blood_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);