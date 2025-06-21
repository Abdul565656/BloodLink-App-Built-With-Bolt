/*
  # Enable Admin Dashboard Access

  1. Security Updates
    - Add RLS policies for admin dashboard access
    - Allow anonymous read access for admin dashboard
    - Enable proper data fetching for dashboard statistics

  2. Tables Updated
    - `donors` table: Add policy for dashboard read access
    - `blood_requests` table: Add policy for dashboard read access

  Note: In production, you should implement proper admin authentication
  and restrict these policies to authenticated admin users only.
*/

-- Enable anonymous read access for donors table (for admin dashboard)
CREATE POLICY "Allow admin dashboard read access for donors"
  ON donors
  FOR SELECT
  TO anon
  USING (true);

-- Enable anonymous read access for blood_requests table (for admin dashboard)  
CREATE POLICY "Allow admin dashboard read access for blood_requests"
  ON blood_requests
  FOR SELECT
  TO anon
  USING (true);

-- Also allow authenticated users to read all data for admin purposes
CREATE POLICY "Allow authenticated admin read access for donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated admin read access for blood_requests"
  ON blood_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admin to update request status
CREATE POLICY "Allow admin to update blood request status"
  ON blood_requests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);