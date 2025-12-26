-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy for user_roles: admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop existing permissive policies on questions table
DROP POLICY IF EXISTS "Anyone can create questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can update questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can delete questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Keep public read access for questions (kids need to view)
CREATE POLICY "Anyone can view questions"
ON public.questions
FOR SELECT
USING (true);

-- Restrict write operations to authenticated admins only
CREATE POLICY "Admins can create questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions"
ON public.questions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions"
ON public.questions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing storage policies
DROP POLICY IF EXISTS "Anyone can upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view question images" ON storage.objects;

-- Keep public read for images
CREATE POLICY "Anyone can view question images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'question-images');

-- Restrict storage write operations to authenticated admins
CREATE POLICY "Admins can upload question images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update question images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'question-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete question images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-images' AND
  public.has_role(auth.uid(), 'admin')
);