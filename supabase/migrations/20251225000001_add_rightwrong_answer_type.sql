-- Allow rightwrong answer type
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_answer_type_check;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_answer_type_check
  CHECK (answer_type IN ('yesno', 'images', 'rightwrong'));
