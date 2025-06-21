/*
  # Disable RLS for public access

  1. Security Changes
    - Disable RLS on donors table to allow public read/write access
    - Disable RLS on blood_requests table to allow public read/write access
    - This enables the public demo version without authentication

  2. Notes
    - This is for demo purposes only
    - In production, you would want proper RLS policies
    - All data becomes publicly accessible
*/

-- Disable RLS on donors table for public access
ALTER TABLE donors DISABLE ROW LEVEL SECURITY;

-- Disable RLS on blood_requests table for public access  
ALTER TABLE blood_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
DROP POLICY IF EXISTS "Anyone can register as a donor" ON donors;
DROP POLICY IF EXISTS "Authenticated users can read all donors" ON donors;
DROP POLICY IF EXISTS "Authenticated users can update donor profiles" ON donors;

DROP POLICY IF EXISTS "Anyone can submit blood requests" ON blood_requests;
DROP POLICY IF EXISTS "Authenticated users can read all blood requests" ON blood_requests;
DROP POLICY IF EXISTS "Authenticated users can update blood requests" ON blood_requests;