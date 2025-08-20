-- Active Subscriptions by Plan Materialized View
-- This view aggregates active subscription data from Stripe, grouped by product/plan
-- It pulls data from the stripesync schema (Stripe Foreign Data Wrapper)

-- Drop existing view if it exists (for re-running migrations)
DROP MATERIALIZED VIEW IF EXISTS public.active_subscriptions_by_plan CASCADE;

-- Create materialized view in public schema
CREATE MATERIALIZED VIEW public.active_subscriptions_by_plan AS
SELECT 
  -- Product/Plan information
  COALESCE(sp.name, 'Unknown Plan') as plan_name,
  sp.id as stripe_product_id,
  sp.description as plan_description,
  
  -- Price information
  spr.id as stripe_price_id,
  spr.unit_amount as price_cents,
  spr.currency,
  
  -- Billing interval extraction from price metadata
  CASE 
    WHEN spr.attrs->'recurring'->>'interval' = 'month' THEN 'monthly'
    WHEN spr.attrs->'recurring'->>'interval' = 'year' THEN 'yearly'
    WHEN spr.attrs->'recurring'->>'interval' = 'week' THEN 'weekly'
    WHEN spr.attrs->'recurring'->>'interval' = 'day' THEN 'daily'
    WHEN spr.type = 'one_time' THEN 'one_time'
    ELSE COALESCE(spr.attrs->'recurring'->>'interval', 'custom')
  END as billing_interval,
  
  -- Aggregated metrics
  COUNT(DISTINCT ss.id) as active_subscription_count,
  COUNT(DISTINCT ss.customer) as unique_customer_count,
  
  -- Revenue calculations
  -- For monthly recurring revenue, we need to normalize yearly subscriptions
  SUM(
    CASE 
      WHEN spr.attrs->'recurring'->>'interval' = 'month' THEN spr.unit_amount
      WHEN spr.attrs->'recurring'->>'interval' = 'year' THEN ROUND(spr.unit_amount::numeric / 12)
      WHEN spr.attrs->'recurring'->>'interval' = 'week' THEN ROUND(spr.unit_amount::numeric * 4.33)
      WHEN spr.attrs->'recurring'->>'interval' = 'day' THEN ROUND(spr.unit_amount::numeric * 30)
      ELSE spr.unit_amount -- For one-time or custom, just use the amount
    END
  ) as monthly_recurring_revenue_cents,
  
  -- Total contract value (actual amounts being charged)
  SUM(spr.unit_amount) as total_revenue_cents,
  
  -- Customer information for joining with local data
  array_agg(DISTINCT sc.email ORDER BY sc.email) FILTER (WHERE sc.email IS NOT NULL) as customer_emails,
  array_agg(DISTINCT ss.customer ORDER BY ss.customer) as stripe_customer_ids,
  
  -- Date ranges
  -- Try to get created date from attrs JSON, fallback to current_period_start
  MIN(
    CASE 
      WHEN ss.attrs->>'created' IS NOT NULL THEN to_timestamp((ss.attrs->>'created')::bigint)
      ELSE ss.current_period_start::timestamp
    END
  ) as earliest_subscription_date,
  MAX(ss.current_period_end::timestamp) as latest_period_end_date,
  
  -- Additional metadata
  COUNT(DISTINCT CASE WHEN ss.attrs->>'cancel_at_period_end' = 'true' THEN ss.id END) as canceling_at_period_end_count

FROM stripesync.subscriptions ss
-- Join with subscription items to get the price
INNER JOIN LATERAL (
  SELECT 
    (item->>'price')::text as price_id
  FROM jsonb_array_elements(ss.attrs->'items'->'data') as item
  LIMIT 1 -- Take first item for simplicity, most subscriptions have one item
) si ON true
-- Join with prices
LEFT JOIN stripesync.prices spr ON spr.id = si.price_id
-- Join with products  
LEFT JOIN stripesync.products sp ON sp.id = spr.product
-- Join with customers for email matching
LEFT JOIN stripesync.customers sc ON sc.id = ss.customer

WHERE 
  -- Only active subscriptions
  ss.attrs->>'status' = 'active'
  -- Only active products (exclude archived)
  AND (sp.active IS NULL OR sp.active = true)
  -- Only active prices (exclude archived)
  AND (spr.active IS NULL OR spr.active = true)

GROUP BY 
  sp.name, 
  sp.id, 
  sp.description,
  spr.id,
  spr.unit_amount,
  spr.currency,
  spr.type,
  spr.attrs->'recurring'->>'interval'

ORDER BY active_subscription_count DESC;

-- Create indexes for better query performance
CREATE INDEX idx_active_subs_by_plan_name ON public.active_subscriptions_by_plan(plan_name);
CREATE INDEX idx_active_subs_by_plan_count ON public.active_subscriptions_by_plan(active_subscription_count DESC);
CREATE INDEX idx_active_subs_by_plan_mrr ON public.active_subscriptions_by_plan(monthly_recurring_revenue_cents DESC);

-- Create a function to refresh the materialized view
-- This can be called manually or scheduled
CREATE OR REPLACE FUNCTION public.refresh_active_subscriptions_view()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use CONCURRENTLY to avoid locking the view during refresh
  -- Note: This requires a unique index on the materialized view
  REFRESH MATERIALIZED VIEW public.active_subscriptions_by_plan;
  
  -- Return current timestamp for logging
  RAISE NOTICE 'Refreshed active_subscriptions_by_plan at %', NOW();
END;
$$;

-- Optional: Create a unique index to enable CONCURRENT refresh
-- This allows the view to be refreshed without locking reads
CREATE UNIQUE INDEX idx_active_subs_by_plan_unique 
ON public.active_subscriptions_by_plan(stripe_product_id, stripe_price_id);

-- Now we can use CONCURRENT refresh
CREATE OR REPLACE FUNCTION public.refresh_active_subscriptions_view_concurrent()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.active_subscriptions_by_plan;
  RAISE NOTICE 'Refreshed active_subscriptions_by_plan (concurrent) at %', NOW();
END;
$$;

-- Example usage:
-- SELECT * FROM public.active_subscriptions_by_plan;
-- SELECT public.refresh_active_subscriptions_view();

-- To schedule automatic refresh (requires pg_cron extension):
-- SELECT cron.schedule('refresh-active-subscriptions', '0 * * * *', 'SELECT public.refresh_active_subscriptions_view_concurrent()');