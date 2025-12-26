import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, QuestionCategory } from '@/types/question';
import { getQuestions } from '@/lib/storage';
import QuestionCard from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique custom categories from questions
  const customCategories = useMemo(() => {
    const defaultCategories = ['M', 'E', 'N'];
    const allCategories = questions.map(q => q.category);
    return [...new Set(allCategories.filter(c => !defaultCategories.includes(c)))];
  }, [questions]);

  // Filter questions by selected category
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter(q => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const loadedQuestions = await getQuestions();
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error(t('settings.errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // ✅ Popup removed — now does nothing
  const handleAnswer = (answer: string) => {
    // popup removed
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredQuestions.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < filteredQuestions.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {t('app.noQuestions')}
          </h1>
          <p className="text-2xl text-muted-foreground">
            {t('app.addQuestionsFirst')}
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/settings')}
            className="text-2xl h-16 px-8"
          >
            <Settings className="w-8 h-8 mr-3" />
            {t('app.goToSettings')}
          </Button>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with category filter */}
          <div className="flex justify-between items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-24 h-12 text-lg font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all" className="text-lg">{t('category.all')}</SelectItem>
                <SelectItem value="M" className="text-lg">M</SelectItem>
                <SelectItem value="E" className="text-lg">E</SelectItem>
                <SelectItem value="N" className="text-lg">N</SelectItem>
                {customCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-lg">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/settings')}
              className="text-lg md:text-xl h-12 md:h-14"
            >
              <Settings className="w-6 h-6 mr-2" />
              {t('app.settings')}
            </Button>
          </div>
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">{t('app.noQuestions')}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentIndex];

  return (
    <div className="min-h-screen bg-[image:var(--gradient-bg)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center gap-4">
          {/* Category Dropdown */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-24 h-12 text-lg font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all" className="text-lg">{t('category.all')}</SelectItem>
              <SelectItem value="M" className="text-lg">M</SelectItem>
              <SelectItem value="E" className="text-lg">E</SelectItem>
              <SelectItem value="N" className="text-lg">N</SelectItem>
              {customCategories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-lg">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Question Counter */}
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold">
              {currentIndex + 1}
            </div>
            <span className="text-2xl md:text-3xl text-muted-foreground font-semibold">
              / {filteredQuestions.length}
            </span>
          </div>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/settings')}
            className="text-lg md:text-xl h-12 md:h-14"
          >
            <Settings className="w-6 h-6 mr-2" />
            <span className="hidden md:inline">{t('app.settings')}</span>
          </Button>
        </div>

        {/* Question Card */}
        <div className="flex items-center justify-center gap-4">
          {filteredQuestions.length > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              className="h-16 w-16 rounded-full p-0 hidden md:flex"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          <div className="flex-1 max-w-4xl">
            <QuestionCard question={currentQuestion} onAnswer={handleAnswer} />
          </div>

          {filteredQuestions.length > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={goToNext}
              className="h-16 w-16 rounded-full p-0 hidden md:flex"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        {filteredQuestions.length > 1 && (
          <div className="flex gap-4 md:hidden">
            <Button
              variant="outline"
              size="lg"
              onClick={goToPrevious}
              className="flex-1 h-14 text-xl"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              {t('app.previous')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={goToNext}
              className="flex-1 h-14 text-xl"
            >
              {t('app.next')}
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
