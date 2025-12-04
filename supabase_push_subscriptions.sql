-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow select for service role only (for sending notifications)
CREATE POLICY "Allow select for service role"
ON push_subscriptions FOR SELECT
TO service_role
USING (true);

-- Allow delete for service role (to clean up invalid subscriptions)
CREATE POLICY "Allow delete for service role"
ON push_subscriptions FOR DELETE
TO service_role
USING (true);

-- Create index on endpoint for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Add comment
COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscriptions for users';
