/*
  # Create partnerships and volunteers tables

  1. New Tables
    - `partnerships`
      - `id` (uuid, primary key)
      - `organization_name` (text, required)
      - `contact_name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `organization_type` (text, required)
      - `message` (text, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `volunteers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `region` (text, required)
      - `motivation` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow anonymous users to insert (for public forms)
    - Allow authenticated users to read all records (for admin)

  3. Indexes
    - Index on email for both tables
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  organization_type text NOT NULL CHECK (organization_type IN ('hospital', 'blood-bank', 'clinic', 'ngo', 'government', 'other')),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  region text NOT NULL,
  motivation text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partnerships_email ON partnerships (email);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships (status);
CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships (created_at);
CREATE INDEX IF NOT EXISTS idx_partnerships_organization_type ON partnerships (organization_type);

CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers (email);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers (status);
CREATE INDEX IF NOT EXISTS idx_volunteers_created_at ON volunteers (created_at);
CREATE INDEX IF NOT EXISTS idx_volunteers_region ON volunteers (region);

-- RLS Policies for partnerships
CREATE POLICY "Anyone can submit partnership inquiries"
  ON partnerships
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all partnerships"
  ON partnerships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin dashboard read access for partnerships"
  ON partnerships
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update partnership status"
  ON partnerships
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for volunteers
CREATE POLICY "Anyone can submit volunteer applications"
  ON volunteers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all volunteers"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin dashboard read access for volunteers"
  ON volunteers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update volunteer status"
  ON volunteers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at on partnerships
CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on volunteers
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();