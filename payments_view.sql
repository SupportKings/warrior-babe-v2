-- Create a view that joins payments with payment_slots, payment_plans, clients, and products
-- This view makes it easier to filter payments by client_id and product_id

CREATE OR REPLACE VIEW public.payments_with_details AS
SELECT 
    p.id,
    p.amount,
    p.payment_date,
    p.payment_method,
    p.stripe_transaction_id,
    p.status,
    p.platform,
    p.declined_at,
    p.disputed_status,
    p.dispute_fee,
    p.created_at,
    p.updated_at,
    
    -- Payment slot details
    ps.id as payment_slot_id,
    ps.amount_due,
    ps.amount_paid,
    ps.due_date as slot_due_date,
    ps.notes as slot_notes,
    
    -- Payment plan details
    pp.id as payment_plan_id,
    pp.name as payment_plan_name,
    pp.platform as plan_platform,
    pp.total_amount as plan_total_amount,
    pp.type as plan_type,
    pp.term_start_date,
    pp.term_end_date,
    
    -- Client details
    pp.client_id,
    c.name as client_name,
    c.email as client_email,
    
    -- Product details
    pp.product_id,
    pr.name as product_name,
    pr.price as product_price
    
FROM 
    public.payments p
    LEFT JOIN public.payment_slots ps ON ps.payment_id = p.id
    LEFT JOIN public.payment_plans pp ON pp.id = ps.plan_id
    LEFT JOIN public.clients c ON c.id = pp.client_id
    LEFT JOIN public.products pr ON pr.id = pp.product_id;

-- Grant appropriate permissions
GRANT SELECT ON public.payments_with_details TO authenticated;
GRANT SELECT ON public.payments_with_details TO anon;

-- Create indexes for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_payment_slots_payment_id ON public.payment_slots(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_slots_plan_id ON public.payment_slots(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_client_id ON public.payment_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_product_id ON public.payment_plans(product_id);

-- Optional: Create a materialized view for better performance if the data doesn't change frequently
-- CREATE MATERIALIZED VIEW public.payments_with_details_materialized AS
-- [Same SELECT statement as above];
-- 
-- CREATE UNIQUE INDEX ON public.payments_with_details_materialized (id);
-- 
-- -- Refresh the materialized view periodically or after data changes
-- REFRESH MATERIALIZED VIEW public.payments_with_details_materialized;