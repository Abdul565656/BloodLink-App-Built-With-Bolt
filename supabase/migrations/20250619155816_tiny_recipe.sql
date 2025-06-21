/*
  # Fix donor registration access for anonymous users

  1. Security Changes
    - Update INSERT policy on donors table to allow anonymous users
    - Keep existing SELECT and UPDATE policies for authenticated users
    - Ensure anonymous users can register as donors without authentication

  This change allows the donor registration form to work for anonymous users
  while maintaining security for viewing and updating donor profiles.
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own donor profile" ON donors;

-- Create a new INSERT policy that allows anonymous users to register
CREATE POLICY "Anyone can register as a donor"
  ON donors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update the UPDATE policy to be more explicit about user matching
DROP POLICY IF EXISTS "Users can update their own donor profile" ON donors;

CREATE POLICY "Users can update their own donor profile"
  ON donors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);