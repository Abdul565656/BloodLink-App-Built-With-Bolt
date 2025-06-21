/*
  # Remove appointments table

  1. Changes
    - Drop the appointments table as it's not being used
    - Remove all associated constraints, indexes, and policies
  
  2. Notes
    - This will clean up the unused appointments table that was causing RLS policy violations
    - The blood request form will be updated to handle requests differently
*/

-- Drop the appointments table and all its dependencies
DROP TABLE IF EXISTS appointments CASCADE;