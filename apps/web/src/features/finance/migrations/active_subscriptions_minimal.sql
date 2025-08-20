-- Minimal Active Subscriptions Count
-- This is the most basic version - just counts active subscriptions

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.active_subscriptions_count CASCADE;

-- Create a minimal materialized view - just count active subscriptions
CREATE MATERIALIZED VIEW public.active_subscriptions_count AS
SELECT 
  COUNT(*) as total_active_subscriptions,
  COUNT(DISTINCT customer) as unique_customers,
  COUNT(*) FILTER (WHERE attrs->>'cancel_at_period_end' = 'true') as canceling_subscriptions
FROM stripesync.subscriptions
WHERE attrs->>'status' = 'active';

-- Test query to see what data we can access
-- This will help debug what's available
CREATE OR REPLACE VIEW public.stripe_subscription_test AS
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  current_period_start,
  current_period_end,
  -- Check what's in attrs
  jsonb_object_keys(attrs) as attr_keys
FROM stripesync.subscriptions
LIMIT 10;

-- Even simpler: Just get raw subscription data
CREATE OR REPLACE VIEW public.stripe_subscriptions_raw AS
SELECT 
  id,
  customer,
  attrs->>'status' as status,
  attrs->'items'->'data'->0->>'price' as first_price_id
FROM stripesync.subscriptions
WHERE attrs->>'status' = 'active'
LIMIT 100;