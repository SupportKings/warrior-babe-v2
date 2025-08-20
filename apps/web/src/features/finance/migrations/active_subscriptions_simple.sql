-- Simple Active Subscriptions by Product
-- This is a simplified version that avoids complex joins and aggregations

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.active_subscriptions_simple CASCADE;

-- Create a simple materialized view
CREATE MATERIALIZED VIEW public.active_subscriptions_simple AS
SELECT 
  -- Get product ID from subscription items
  (ss.attrs->'items'->'data'->0->'price'->>'product')::text as product_id,
  
  -- Basic subscription info
  ss.id as subscription_id,
  ss.customer as customer_id,
  ss.attrs->>'status' as status,
  
  -- Price info from first item
  (ss.attrs->'items'->'data'->0->'price'->>'unit_amount')::bigint as price_cents,
  (ss.attrs->'items'->'data'->0->'price'->>'currency')::text as currency,
  
  -- Billing interval
  COALESCE(
    ss.attrs->'items'->'data'->0->'price'->'recurring'->>'interval',
    'one_time'
  ) as billing_interval,
  
  -- Dates
  ss.current_period_start::timestamp as period_start,
  ss.current_period_end::timestamp as period_end,
  
  -- Cancellation flag
  (ss.attrs->>'cancel_at_period_end')::boolean as will_cancel

FROM stripesync.subscriptions ss
WHERE 
  -- Only active subscriptions
  ss.attrs->>'status' = 'active';

-- Create index for better performance
CREATE INDEX idx_active_subs_simple_product ON public.active_subscriptions_simple(product_id);
CREATE INDEX idx_active_subs_simple_customer ON public.active_subscriptions_simple(customer_id);

-- Now create a summary view that groups by product
CREATE OR REPLACE VIEW public.subscription_summary_by_product AS
SELECT 
  ass.product_id,
  sp.name as product_name,
  COUNT(*) as subscription_count,
  COUNT(DISTINCT ass.customer_id) as unique_customers,
  
  -- Group by currency to handle multiple currencies
  ass.currency,
  SUM(ass.price_cents) as total_revenue_cents,
  
  -- MRR calculation
  SUM(
    CASE 
      WHEN ass.billing_interval = 'month' THEN ass.price_cents
      WHEN ass.billing_interval = 'year' THEN ROUND(ass.price_cents::numeric / 12)
      WHEN ass.billing_interval = 'week' THEN ROUND(ass.price_cents::numeric * 4.33)
      ELSE ass.price_cents
    END
  ) as monthly_recurring_revenue_cents,
  
  COUNT(*) FILTER (WHERE ass.will_cancel = true) as canceling_count

FROM public.active_subscriptions_simple ass
LEFT JOIN stripesync.products sp ON sp.id = ass.product_id
GROUP BY ass.product_id, sp.name, ass.currency
ORDER BY subscription_count DESC;

-- Refresh function
CREATE OR REPLACE FUNCTION public.refresh_active_subscriptions_simple()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.active_subscriptions_simple;
  RAISE NOTICE 'Refreshed active_subscriptions_simple at %', NOW();
END;
$$;

-- Grant permissions (if needed for non-service role access)
-- GRANT SELECT ON public.active_subscriptions_simple TO authenticated;
-- GRANT SELECT ON public.subscription_summary_by_product TO authenticated;