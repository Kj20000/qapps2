-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  image TEXT,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('yesno', 'images')),
  image_answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth needed for this learning app)
CREATE POLICY "Anyone can view questions" 
ON public.questions 
FOR SELECT 
USING (true);

-- Allow public insert
CREATE POLICY "Anyone can create questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (true);

-- Allow public update
CREATE POLICY "Anyone can update questions" 
ON public.questions 
FOR UPDATE 
USING (true);

-- Allow public delete
CREATE POLICY "Anyone can delete questions" 
ON public.questions 
FOR DELETE 
USING (true);

-- Create storage bucket for question images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('question-images', 'question-images', true);

-- Allow public access to question images
CREATE POLICY "Anyone can view question images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'question-images');

CREATE POLICY "Anyone can upload question images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'question-images');

CREATE POLICY "Anyone can update question images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'question-images');

CREATE POLICY "Anyone can delete question images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'question-images');