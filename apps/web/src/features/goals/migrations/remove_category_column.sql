-- Migration to remove the category column from goal_types table
-- Run this migration after ensuring all data has been migrated to use category_id

-- First, ensure all goal_types have a category_id if they have a category
UPDATE goal_types gt
SET category_id = gc.id
FROM goal_categories gc
WHERE gt.category = gc.name
  AND gt.category_id IS NULL
  AND gt.category IS NOT NULL;

-- Create any missing categories from the text category field
INSERT INTO goal_categories (name, is_active)
SELECT DISTINCT category, true
FROM goal_types
WHERE category IS NOT NULL
  AND category_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM goal_categories gc WHERE gc.name = goal_types.category
  );

-- Update goal_types again to ensure all have category_id
UPDATE goal_types gt
SET category_id = gc.id
FROM goal_categories gc
WHERE gt.category = gc.name
  AND gt.category_id IS NULL;

-- Once you've verified all data is migrated, uncomment and run this:
-- ALTER TABLE goal_types DROP COLUMN category;