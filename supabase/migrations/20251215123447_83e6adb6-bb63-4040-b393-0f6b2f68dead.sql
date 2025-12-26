-- Add category column to questions table
ALTER TABLE public.questions 
ADD COLUMN category text NOT NULL DEFAULT 'M';

-- Add constraint for valid categories (M=Morning, E=Evening, N=Night, or custom)
-- Custom categories will be stored as any other text value