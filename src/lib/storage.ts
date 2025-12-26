import { supabase } from '@/integrations/supabase/client';
import { Question, ImageAnswer, RightWrongImages } from '@/types/question';

// Upload image to Supabase Storage and return public URL
export const uploadImage = async (base64Data: string, fileName: string): Promise<string> => {
  // If it's already a URL (not base64), return as-is
  if (base64Data.startsWith('http')) {
    return base64Data;
  }
  
  // If empty, return empty
  if (!base64Data) {
    return '';
  }

  // Convert base64 to blob
  const base64Response = await fetch(base64Data);
  const blob = await base64Response.blob();
  
  const filePath = `${Date.now()}-${fileName}`;
  
  const { error } = await supabase.storage
    .from('question-images')
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('question-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Convert DB row to Question type
const rowToQuestion = (row: any): Question => ({
  id: row.id,
  text: row.text,
  image: row.image || undefined,
  answerType: row.answer_type as 'yesno' | 'images' | 'rightwrong',
  imageAnswers: row.image_answers as ImageAnswer[] || undefined,
  rightWrongImages: row.image_answers && row.answer_type === 'rightwrong' ? row.image_answers as RightWrongImages : undefined,
  category: row.category || 'M',
});

// Get all questions from Supabase
export const getQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return (data || []).map(rowToQuestion);
};

// Save question (create or update)
export const saveQuestion = async (question: Question): Promise<void> => {
  // Upload images if they're base64
  let imageUrl = question.image || null;
  if (question.image && question.image.startsWith('data:')) {
    imageUrl = await uploadImage(question.image, `question-${question.id}`);
  }

  let imageAnswers = question.imageAnswers || [];
  if (imageAnswers.length > 0) {
    imageAnswers = await Promise.all(
      imageAnswers.map(async (answer) => {
        if (answer.image && answer.image.startsWith('data:')) {
          const uploadedUrl = await uploadImage(answer.image, `answer-${answer.id}`);
          return { ...answer, image: uploadedUrl };
        }
        return answer;
      })
    );
  }

  // Handle rightWrongImages if present
  let rightWrongImages = question.rightWrongImages || null;
  if (rightWrongImages) {
    if (rightWrongImages.image1 && rightWrongImages.image1.startsWith('data:')) {
      rightWrongImages.image1 = await uploadImage(rightWrongImages.image1, `rw-image1-${question.id}`);
    }
    if (rightWrongImages.image2 && rightWrongImages.image2.startsWith('data:')) {
      rightWrongImages.image2 = await uploadImage(rightWrongImages.image2, `rw-image2-${question.id}`);
    }
    if (rightWrongImages.rightIcon && rightWrongImages.rightIcon.startsWith('data:')) {
      rightWrongImages.rightIcon = await uploadImage(rightWrongImages.rightIcon, `rw-right-icon-${question.id}`);
    }
    if (rightWrongImages.wrongIcon && rightWrongImages.wrongIcon.startsWith('data:')) {
      rightWrongImages.wrongIcon = await uploadImage(rightWrongImages.wrongIcon, `rw-wrong-icon-${question.id}`);
    }
  }

  // Prepare the data to save
  let dataToSave: any = {
    id: question.id,
    text: question.text,
    image: imageUrl,
    answer_type: question.answerType,
    category: question.category,
  };

  // Store either image_answers or rightWrongImages based on answer type
  if (question.answerType === 'rightwrong') {
    dataToSave.image_answers = rightWrongImages as any;
  } else if (question.answerType === 'images') {
    dataToSave.image_answers = imageAnswers as any;
  } else {
    dataToSave.image_answers = null;
  }

  const { error } = await supabase
    .from('questions')
    .upsert(dataToSave, { onConflict: 'id' });

  if (error) {
    console.error('Error saving question:', error);
    throw error;
  }
};

// Add a new question
export const addQuestion = async (question: Question): Promise<void> => {
  await saveQuestion(question);
};

// Update an existing question
export const updateQuestion = async (id: string, updatedQuestion: Question): Promise<void> => {
  await saveQuestion({ ...updatedQuestion, id });
};

// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Legacy sync functions - keep for backwards compatibility
export const saveQuestions = async (questions: Question[]): Promise<void> => {
  for (const question of questions) {
    await saveQuestion(question);
  }
};
