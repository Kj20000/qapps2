import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '@/types/question';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '@/lib/storage';
import QuestionForm from '@/components/QuestionForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Languages, FileQuestion, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, Language } from '@/contexts/LanguageContext';

type QuestionTemplate = 'default' | 'ror';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate>('default');

  // Get custom categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('custom-categories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  }, []);

  const handleAddCustomCategory = (category: string) => {
    if (!customCategories.includes(category)) {
      const updated = [...customCategories, category];
      setCustomCategories(updated);
      localStorage.setItem('custom-categories', JSON.stringify(updated));
    }
  };

  const loadQuestions = async () => {
    try {
      const loaded = await getQuestions();
      setQuestions(loaded);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error(t('settings.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSave = async (question: Question) => {
    setIsSaving(true);
    try {
      if (editingQuestion) {
        await updateQuestion(question.id, question);
        toast.success(t('settings.questionUpdated'));
      } else {
        await addQuestion(question);
        toast.success(t('settings.questionAdded'));
      }
      await loadQuestions();
      setEditingQuestion(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(t('settings.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('settings.confirmDelete'))) {
      try {
        await deleteQuestion(id);
        await loadQuestions();
        toast.success(t('settings.questionDeleted'));
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error(t('settings.errorDeleting'));
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
    toast.success(t('settings.languageChanged'));
  };

  const createDefaultQuestion = (template: QuestionTemplate) => {
    const defaultQuestion: Question = {
      id: crypto.randomUUID(),
      text: template === 'ror' ? 'Right or Wrong?' : 'New Question',
      image: undefined,
      answerType: template === 'ror' ? 'rightwrong' : 'yesno',
      imageAnswers: template === 'ror' ? undefined : [],
      rightWrongImages: template === 'ror' ? undefined : undefined,
      category: 'M',
    };
    setSelectedTemplate(template);
    setIsAdding(true);
    // Set the editing question to the template, which will be used in the form
    setEditingQuestion(defaultQuestion);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdding || editingQuestion) {
    const isTemplate = selectedTemplate === 'ror' || selectedTemplate === 'default';
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              setIsAdding(false);
              setEditingQuestion(null);
              setSelectedTemplate('default');
            }}
            className="text-lg"
            disabled={isSaving}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('settings.goBack')}
          </Button>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {isTemplate && selectedTemplate === 'ror' ? 'Right or Wrong (ROR)' : isTemplate && selectedTemplate === 'default' ? t('settings.addQuestion') : t('settings.editQuestion')}
          </h1>

          <QuestionForm
            question={editingQuestion || undefined}
            onSave={handleSave}
            onCancel={() => {
              setIsAdding(false);
              setEditingQuestion(null);
              setSelectedTemplate('default');
            }}
            isSaving={isSaving}
            customCategories={customCategories}
            onAddCustomCategory={handleAddCustomCategory}
            template={selectedTemplate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/')}
              className="text-lg mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('settings.mainPage')}
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {t('settings.title')}
            </h1>
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-14 text-lg">
            <TabsTrigger value="questions" className="text-lg h-12 gap-2">
              <FileQuestion className="w-5 h-5" />
              {t('settings.questions')}
            </TabsTrigger>
            <TabsTrigger value="language" className="text-lg h-12 gap-2">
              <Languages className="w-5 h-5" />
              {t('settings.language')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6">
            <div className="flex justify-end mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="text-xl h-14 px-8">
                    <Plus className="w-6 h-6 mr-2" />
                    {t('settings.newQuestion')}
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-lg">
                  <DropdownMenuItem onClick={() => createDefaultQuestion('default')} className="text-lg py-3 cursor-pointer">
                    <Plus className="w-5 h-5 mr-3" />
                    New Question
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => createDefaultQuestion('ror')} className="text-lg py-3 cursor-pointer">
                    <Plus className="w-5 h-5 mr-3" />
                    Right or Wrong (ROR)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {questions.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-2xl text-muted-foreground mb-6">
                  {t('settings.noQuestions')}
                </p>
                <Button size="lg" onClick={() => setIsAdding(true)} className="text-xl">
                  <Plus className="w-6 h-6 mr-2" />
                  {t('settings.addFirst')}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="p-6 space-y-4 hover:shadow-[var(--shadow-elevated)] transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                            {index + 1}
                          </span>
                          <Badge variant="secondary" className="text-sm font-bold">
                            {question.category}
                          </Badge>
                          <h3 className="text-2xl font-bold text-foreground line-clamp-2 flex-1">
                            {question.text}
                          </h3>
                        </div>
                        {question.image && (
                          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border-2">
                            <img
                              src={question.image}
                              alt="Question"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-muted-foreground text-lg">
                          {t('settings.answerType')}:{' '}
                          <span className="font-semibold">
                            {question.answerType === 'yesno' ? t('settings.yesNo') : t('settings.images')}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="language" className="mt-6">
            <Card className="p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-6">{t('settings.selectLanguage')}</h2>
              <RadioGroup
                value={language}
                onValueChange={handleLanguageChange}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4 p-4 rounded-lg border-2 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="en" id="en" className="w-6 h-6" />
                  <Label htmlFor="en" className="text-xl cursor-pointer flex-1">
                    🇬🇧 English
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-lg border-2 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="hi" id="hi" className="w-6 h-6" />
                  <Label htmlFor="hi" className="text-xl cursor-pointer flex-1">
                    🇮🇳 हिंदी (Hindi)
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
