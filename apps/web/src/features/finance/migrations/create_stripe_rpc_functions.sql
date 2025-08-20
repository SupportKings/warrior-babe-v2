-- RPC Functions to Access Stripe Data
-- These functions use SECURITY DEFINER to bypass permission issues

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_stripe_subscriptions_basic();

-- Create RPC function to access the stripe_subscriptions_basic view
CREATE OR REPLACE FUNCTION public.get_stripe_subscriptions_basic()
RETURNS TABLE (
  subscription_id text,
  stripe_customer_id text,
  status text,
  current_period_start timestamp,
  current_period_end timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ssb.subscription_id,
    ssb.stripe_customer_id,
    ssb.status,
    ssb.current_period_start,
    ssb.current_period_end
  FROM public.stripe_subscriptions_basic ssb;
END;
$$;

-- Alternative: Direct query to stripesync schema with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_stripe_subscriptions_direct();

CREATE OR REPLACE FUNCTION public.get_stripe_subscriptions_direct()
RETURNS TABLE (
  subscription_id text,
  stripe_customer_id text,
  status text,
  current_period_start text,
  current_period_end text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, stripesync
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id::text as subscription_id,
    s.customer::text as stripe_customer_id,
    (s.attrs->>'status')::text as status,
    s.current_period_start::text,
    s.current_period_end::text
  FROM stripesync.subscriptions s
  WHERE s.attrs->>'status' = 'active'
  LIMIT 10;
END;
$$;

-- Test function to check if we can access stripesync at all
DROP FUNCTION IF EXISTS public.test_stripe_access();

CREATE OR REPLACE FUNCTION public.test_stripe_access()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Try to count active subscriptions
  SELECT json_build_object(
    'success', true,
    'message', 'Successfully accessed stripesync schema',
    'active_subscription_count', (
      SELECT COUNT(*) 
      FROM stripesync.subscriptions 
      WHERE attrs->>'status' = 'active'
    )
  ) INTO result;
  
  RETURN result;
EXCEPTION 
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error accessing stripesync: ' || SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_stripe_subscriptions_basic() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_stripe_subscriptions_direct() TO service_role;
GRANT EXECUTE ON FUNCTION public.test_stripe_access() TO service_role;

-- If you want authenticated users to access these functions, uncomment below:
-- GRANT EXECUTE ON FUNCTION public.get_stripe_subscriptions_basic() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_stripe_subscriptions_direct() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.test_stripe_access() TO authenticated;