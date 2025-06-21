/*
  # Allow anonymous users to submit blood requests

  1. Security Changes
    - Add policy to allow anonymous (anon) users to insert appointments
    - This enables the public blood request form to work without authentication
    - The policy allows any anonymous user to create appointment records

  2. Notes
    - This is safe for a public blood request form where anyone should be able to submit requests
    - The user_id field will still be populated but won't be tied to actual authenticated users
    - Existing policies for authenticated users remain unchanged
*/

-- Allow anonymous users to insert appointments (for public blood request form)
CREATE POLICY "Anonymous users can submit blood requests"
  ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);