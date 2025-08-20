-- Test Simple View for Stripe Data
-- Start with the most basic view to test connectivity

-- Drop if exists
DROP VIEW IF EXISTS public.stripe_active_subscriptions_test CASCADE;

-- Create a very simple view - just active subscription count
CREATE VIEW public.stripe_active_subscriptions_test AS
SELECT 
  COUNT(*) as total_active,
  COUNT(DISTINCT customer) as unique_customers
FROM stripesync.subscriptions
WHERE attrs->>'status' = 'active';

-- If the above works, try this slightly more complex version
DROP VIEW IF EXISTS public.stripe_subscriptions_basic CASCADE;

CREATE VIEW public.stripe_subscriptions_basic AS
SELECT 
  id as subscription_id,
  customer as stripe_customer_id,
  attrs->>'status' as status,
  current_period_start,
  current_period_end
FROM stripesync.subscriptions
WHERE attrs->>'status' = 'active'
LIMIT 10;

-- Test if we can access products
DROP VIEW IF EXISTS public.stripe_products_test CASCADE;

CREATE VIEW public.stripe_products_test AS
SELECT 
  id as product_id,
  name as product_name,
  active
FROM stripesync.products
WHERE active = true
LIMIT 10;

-- Test if we can join subscriptions with a simple extraction
DROP VIEW IF EXISTS public.stripe_subscriptions_with_product CASCADE;

CREATE VIEW public.stripe_subscriptions_with_product AS
SELECT 
  s.id as subscription_id,
  s.customer,
  -- Extract first price ID from items array
  s.attrs->'items'->'data'->0->'price'->>'id' as price_id,
  -- Extract product ID from the price object
  s.attrs->'items'->'data'->0->'price'->>'product' as product_id
FROM stripesync.subscriptions s
WHERE s.attrs->>'status' = 'active'
LIMIT 20;