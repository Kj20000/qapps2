import { useState, useEffect } from 'react';
import { Question, AnswerType, ImageAnswer, QuestionCategory, RightWrongImages } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Crop } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageCropper from './ImageCropper';

interface QuestionFormProps {
  question?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  isSaving?: boolean;
  customCategories?: string[];
  onAddCustomCategory?: (category: string) => void;
  template?: 'default' | 'ror';
}

const QuestionForm = ({ question, onSave, onCancel, isSaving = false, customCategories = [], onAddCustomCategory, template }: QuestionFormProps) => {
  const { t, language } = useLanguage();
  const [text, setText] = useState(question?.text || '');
  const [image, setImage] = useState(question?.image || '');
  const [answerType, setAnswerType] = useState<AnswerType>(question?.answerType || 'yesno');
  const [category, setCategory] = useState<QuestionCategory>(question?.category || 'M');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [imageAnswers, setImageAnswers] = useState<ImageAnswer[]>(
    question?.imageAnswers || [{ id: crypto.randomUUID(), image: '', text: '' }]
  );
  // Default high-quality icons for right/wrong answers
  const defaultRightIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%232ed573'/%3E%3Cstop offset='100%25' stop-color='%2316a34a'/%3E%3C/linearGradient%3E%3Cfilter id='shadow' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeDropShadow dx='0' dy='6' stdDeviation='12' flood-color='%23000000' flood-opacity='0.25'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='220' fill='url(%23g)' filter='url(%23shadow)'/%3E%3Cpath d='M164 266 L228 330 L352 196' fill='none' stroke='white' stroke-width='40' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
  const defaultWrongIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='r' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f87171'/%3E%3Cstop offset='100%25' stop-color='%23dc2626'/%3E%3C/linearGradient%3E%3Cfilter id='shadow' x='-20%25' y='-20%25' width='140%25' height='140%25'%3E%3CfeDropShadow dx='0' dy='6' stdDeviation='12' flood-color='%23000000' flood-opacity='0.25'/%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='220' fill='url(%23r)' filter='url(%23shadow)'/%3E%3Cpath d='M180 180 L332 332 M332 180 L180 332' fill='none' stroke='white' stroke-width='40' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  const initialRightWrongImages: RightWrongImages = question?.rightWrongImages
    ? {
        image1: question.rightWrongImages.image1 || '',
        image2: question.rightWrongImages.image2 || '',
        rightIcon: question.rightWrongImages.rightIcon || defaultRightIcon,
        wrongIcon: question.rightWrongImages.wrongIcon || defaultWrongIcon,
      }
    : {
        image1: '',
        image2: '',
        rightIcon: defaultRightIcon,
        wrongIcon: defaultWrongIcon,
      };

  const [rightWrongImages, setRightWrongImages] = useState<RightWrongImages>(initialRightWrongImages);
  
  // Cropping state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [cropTarget, setCropTarget] = useState<'main' | 'rw1' | 'rw2' | 'rwRight' | 'rwWrong' | string>('main');

  const handleImageUpload = (file: File, target: 'main' | 'rw1' | 'rw2' | 'rwRight' | 'rwWrong' | string) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropTarget(target);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (cropTarget === 'main') {
      setImage(croppedImageUrl);
    } else if (cropTarget === 'rw1') {
      setRightWrongImages({ ...rightWrongImages, image1: croppedImageUrl });
    } else if (cropTarget === 'rw2') {
      setRightWrongImages({ ...rightWrongImages, image2: croppedImageUrl });
    } else if (cropTarget === 'rwRight') {
      setRightWrongImages({ ...rightWrongImages, rightIcon: croppedImageUrl });
    } else if (cropTarget === 'rwWrong') {
      setRightWrongImages({ ...rightWrongImages, wrongIcon: croppedImageUrl });
    } else {
      updateImageAnswer(cropTarget, 'image', croppedImageUrl);
    }
    setCropperOpen(false);
    setImageToCrop('');
  };

  const addImageAnswer = () => {
    setImageAnswers([
      ...imageAnswers,
      { id: crypto.randomUUID(), image: '', text: '' },
    ]);
  };

  const removeImageAnswer = (id: string) => {
    setImageAnswers(imageAnswers.filter(a => a.id !== id));
  };

  const updateImageAnswer = (id: string, field: 'image' | 'text', value: string) => {
    setImageAnswers(
      imageAnswers.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && onAddCustomCategory) {
      onAddCustomCategory(customCategory.trim());
      setCategory(customCategory.trim());
      setCustomCategory('');
      setShowCustomInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error(t('form.enterQuestion'));
      return;
    }

    if (answerType === 'images' && imageAnswers.length === 0) {
      toast.error(t('form.addImageAnswers'));
      return;
    }

    if (answerType === 'rightwrong' && (!rightWrongImages.image1 || !rightWrongImages.image2 || !rightWrongImages.rightIcon || !rightWrongImages.wrongIcon)) {
      toast.error(t('form.addAllRightWrongImages'));
      return;
    }

    const newQuestion: Question = {
      id: question?.id || crypto.randomUUID(),
      text: text.trim(),
      image: image || undefined,
      answerType,
      imageAnswers: answerType === 'images' ? imageAnswers : undefined,
      rightWrongImages: answerType === 'rightwrong' ? rightWrongImages : undefined,
      category,
    };

    onSave(newQuestion);
  };

  return (
    <Card className="p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="text-xl font-semibold">{t('category.label')}</Label>
          <div className="flex gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger className="flex-1 h-12 text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="M" className="text-lg">M - {t('category.morning')}</SelectItem>
                <SelectItem value="E" className="text-lg">E - {t('category.evening')}</SelectItem>
                <SelectItem value="N" className="text-lg">N - {t('category.night')}</SelectItem>
                {customCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-lg">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="h-12 px-4"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          {showCustomInput && (
            <div className="flex gap-2 mt-2">
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder={t('category.addCustom')}
                className="flex-1 h-12 text-lg"
              />
              <Button type="button" onClick={handleAddCustomCategory} className="h-12">
                {t('form.save')}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-text" className="text-xl font-semibold">
            {t('form.questionText')}
          </Label>
          <Input
            id="question-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('form.questionText')}
            className="text-2xl h-16 border-2"
          />
        </div>

        {template !== 'ror' && (
          <div className="space-y-2">
            <Label className="text-xl font-semibold">{t('form.questionImage')}</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'main');
                }}
                className="flex-1"
              />
              {image && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 relative group">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageToCrop(image);
                      setCropTarget('main');
                      setCropperOpen(true);
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Crop className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {template !== 'ror' && (
          <Tabs value={answerType} onValueChange={(v) => setAnswerType(v as AnswerType)}>
            <TabsList className={`grid w-full h-14 ${template === 'default' ? 'grid-cols-2' : 'grid-cols-3'}`}>
              <TabsTrigger value="yesno" className="text-lg">{t('settings.yesNo')}</TabsTrigger>
              <TabsTrigger value="images" className="text-lg">{t('settings.images')}</TabsTrigger>
              {template !== 'default' && (
                <TabsTrigger value="rightwrong" className="text-lg">{t('settings.rightWrong')}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="yesno" className="mt-4">
              <p className="text-muted-foreground text-center py-4">
                {t('settings.yesNo')}
              </p>
            </TabsContent>

            <TabsContent value="images" className="mt-4 space-y-4">
              {imageAnswers.map((answer, index) => (
                <Card key={answer.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">{t('form.answerText')} {index + 1}</Label>
                    {imageAnswers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImageAnswer(answer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <Input
                    value={answer.text}
                    onChange={(e) => updateImageAnswer(answer.id, 'text', e.target.value)}
                    placeholder={t('form.answerText')}
                    className="text-xl h-12"
                  />

                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, answer.id);
                        }
                      }}
                      className="flex-1"
                    />
                    {answer.image && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                        <img
                          src={answer.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageToCrop(answer.image);
                            setCropTarget(answer.id);
                            setCropperOpen(true);
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Crop className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addImageAnswer}
                className="w-full h-12 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('form.addAnswer')}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {template === 'ror' && (
          <div className="space-y-6">
            {/* Question Images Section - Above Tabs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('form.questionImages')}</h3>
              <Card className="p-4 space-y-3">
                <Label className="text-lg font-semibold">{t('form.image1')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'rw1');
                    }}
                    className="flex-1"
                  />
                  {rightWrongImages.image1 && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                      <img
                        src={rightWrongImages.image1}
                        alt="Image 1 Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageToCrop(rightWrongImages.image1);
                          setCropTarget('rw1');
                          setCropperOpen(true);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Crop className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <Label className="text-lg font-semibold">{t('form.image2')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'rw2');
                    }}
                    className="flex-1"
                  />
                  {rightWrongImages.image2 && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                      <img
                        src={rightWrongImages.image2}
                        alt="Image 2 Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageToCrop(rightWrongImages.image2);
                          setCropTarget('rw2');
                          setCropperOpen(true);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Crop className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Tabs for Answer Type */}
          <Tabs value={answerType} onValueChange={(v) => setAnswerType(v as AnswerType)}>
            <TabsList className="grid w-full grid-cols-2 h-14">
              <TabsTrigger value="rightwrong" className="text-lg">{t('settings.rightWrong')}</TabsTrigger>
              <TabsTrigger value="images" className="text-lg">{t('settings.images')}</TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="mt-4 space-y-4">
              {imageAnswers.map((answer, index) => (
                <Card key={answer.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-semibold">{t('form.answerText')} {index + 1}</Label>
                    {imageAnswers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImageAnswer(answer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <Input
                    value={answer.text}
                    onChange={(e) => updateImageAnswer(answer.id, 'text', e.target.value)}
                    placeholder={t('form.answerText')}
                    className="text-xl h-12"
                  />

                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, answer.id);
                        }
                      }}
                      className="flex-1"
                    />
                    {answer.image && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                        <img
                          src={answer.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageToCrop(answer.image);
                            setCropTarget(answer.id);
                            setCropperOpen(true);
                          }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Crop className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addImageAnswer}
                className="w-full h-12 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('form.addAnswer')}
              </Button>
            </TabsContent>

            <TabsContent value="rightwrong" className="mt-4 space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('form.answerIcons')}</h3>
                <Card className="p-4 space-y-3 bg-green-50">
                  <Label className="text-lg font-semibold">{t('form.rightIcon')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'rwRight');
                    }}
                    className="flex-1"
                  />
                  {rightWrongImages.rightIcon && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                      <img
                        src={rightWrongImages.rightIcon}
                        alt="Right Icon Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageToCrop(rightWrongImages.rightIcon);
                          setCropTarget('rwRight');
                          setCropperOpen(true);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Crop className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 space-y-3 bg-red-50">
                <Label className="text-lg font-semibold">{t('form.wrongIcon')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'rwWrong');
                    }}
                    className="flex-1"
                  />
                  {rightWrongImages.wrongIcon && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 relative group">
                      <img
                        src={rightWrongImages.wrongIcon}
                        alt="Wrong Icon Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageToCrop(rightWrongImages.wrongIcon);
                          setCropTarget('rwWrong');
                          setCropperOpen(true);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Crop className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button type="submit" size="lg" className="flex-1 text-xl h-14" disabled={isSaving}>
            {isSaving ? t('form.saving') : t('form.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            className="flex-1 text-xl h-14"
            disabled={isSaving}
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>

      <ImageCropper
        imageSrc={imageToCrop}
        open={cropperOpen}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropperOpen(false);
          setImageToCrop('');
        }}
      />
    </Card>
  );
};

export default QuestionForm;
