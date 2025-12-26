import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Index page
    'app.title': 'Child Assessment',
    'app.startAssessment': 'Start Assessment',
    'app.settings': 'Settings',
    'app.noQuestions': 'No questions available',
    'app.addQuestionsFirst': 'Please add questions in settings first',
    'app.goToSettings': 'Go to Settings',
    'app.question': 'Question',
    'app.of': 'of',
    'app.yes': 'Yes',
    'app.no': 'No',
    'app.right': 'Right',
    'app.wrong': 'Wrong',
    'app.next': 'Next',
    'app.previous': 'Previous',
    'app.finish': 'Finish',
    'app.assessmentComplete': 'Assessment Complete!',
    'app.thankYou': 'Thank you for completing the assessment',
    'app.startAgain': 'Start Again',
    
    // Settings page
    'settings.title': 'Question Management',
    'settings.mainPage': 'Main Page',
    'settings.newQuestion': 'New Question',
    'settings.noQuestions': 'No questions found',
    'settings.addFirst': 'Add First Question',
    'settings.editQuestion': 'Edit Question',
    'settings.addQuestion': 'Add New Question',
    'settings.goBack': 'Go Back',
    'settings.answerType': 'Answer Type',
    'settings.yesNo': 'Yes/No',
    'settings.images': 'Images',
    'settings.rightWrong': 'Right or Wrong',
    'settings.questionUpdated': 'Question updated',
    'settings.questionAdded': 'Question added',
    'settings.questionDeleted': 'Question deleted',
    'settings.errorLoading': 'Error loading questions',
    'settings.errorSaving': 'Error saving question',
    'settings.errorDeleting': 'Error deleting question',
    'settings.confirmDelete': 'Do you want to delete this question?',
    
    // Language settings
    'settings.language': 'Language',
    'settings.questions': 'Questions',
    'settings.selectLanguage': 'Select Language',
    'settings.languageChanged': 'Language changed',
    
    // Categories
    'category.label': 'Category',
    'category.morning': 'Morning',
    'category.evening': 'Evening',
    'category.night': 'Night',
    'category.custom': 'Custom',
    'category.addCustom': 'Add Custom Category',
    'category.all': 'All',
    'category.selectCategory': 'Select Category',
    
    // Question form
    'form.questionText': 'Question Text',
    'form.questionImage': 'Question Image (Optional)',
    'form.answerType': 'Answer Type',
    'form.imageAnswers': 'Image Answers',
    'form.addAnswer': 'Add Answer',
    'form.answerText': 'Answer Text',
    'form.questionImages': 'Question Images',
    'form.answerIcons': 'Answer Icon Images',
    'form.image1': 'Image 1',
    'form.image2': 'Image 2',
    'form.rightIcon': 'Right Icon Image',
    'form.wrongIcon': 'Wrong Icon Image',
    'form.addBothImages': 'Please add both images for Right/Wrong question',
    'form.addAllRightWrongImages': 'Please add both question images and both answer icon images',
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.saving': 'Saving...',
    'form.enterQuestion': 'Please enter a question',
    'form.addImageAnswers': 'Please add at least one image answer',
  },
  hi: {
    // Index page
    'app.title': 'बाल मूल्यांकन',
    'app.startAssessment': 'मूल्यांकन शुरू करें',
    'app.settings': 'सेटिंग्स',
    'app.noQuestions': 'कोई प्रश्न उपलब्ध नहीं',
    'app.addQuestionsFirst': 'कृपया पहले सेटिंग्स में प्रश्न जोड़ें',
    'app.goToSettings': 'सेटिंग्स पर जाएं',
    'app.question': 'प्रश्न',
    'app.of': 'का',
    'app.yes': 'हाँ',
    'app.no': 'नहीं',
    'app.right': 'सही',
    'app.wrong': 'गलत',
    'app.next': 'अगला',
    'app.previous': 'पिछला',
    'app.finish': 'समाप्त',
    'app.assessmentComplete': 'मूल्यांकन पूर्ण!',
    'app.thankYou': 'मूल्यांकन पूरा करने के लिए धन्यवाद',
    'app.startAgain': 'फिर से शुरू करें',
    
    // Settings page
    'settings.title': 'प्रश्न प्रबंधन',
    'settings.mainPage': 'मुख्य पृष्ठ',
    'settings.newQuestion': 'नया प्रश्न',
    'settings.noQuestions': 'कोई प्रश्न नहीं मिला',
    'settings.addFirst': 'पहला प्रश्न जोड़ें',
    'settings.editQuestion': 'प्रश्न संपादित करें',
    'settings.addQuestion': 'नया प्रश्न जोड़ें',
    'settings.goBack': 'वापस जाएं',
    'settings.answerType': 'उत्तर प्रकार',
    'settings.yesNo': 'हाँ/नहीं',
    'settings.images': 'तस्वीरें',
    'settings.rightWrong': 'सही या गलत',
    'settings.questionUpdated': 'प्रश्न अपडेट किया गया',
    'settings.questionAdded': 'प्रश्न जोड़ा गया',
    'settings.questionDeleted': 'प्रश्न हटाया गया',
    'settings.errorLoading': 'प्रश्न लोड करने में त्रुटि',
    'settings.errorSaving': 'प्रश्न सहेजने में त्रुटि',
    'settings.errorDeleting': 'प्रश्न हटाने में त्रुटि',
    'settings.confirmDelete': 'क्या आप इस प्रश्न को हटाना चाहते हैं?',
    
    // Language settings
    'settings.language': 'भाषा',
    'settings.questions': 'प्रश्न',
    'settings.selectLanguage': 'भाषा चुनें',
    'settings.languageChanged': 'भाषा बदली गई',
    
    // Categories
    'category.label': 'श्रेणी',
    'category.morning': 'सुबह',
    'category.evening': 'शाम',
    'category.night': 'रात',
    'category.custom': 'कस्टम',
    'category.addCustom': 'कस्टम श्रेणी जोड़ें',
    'category.all': 'सभी',
    'category.selectCategory': 'श्रेणी चुनें',
    
    // Question form
    'form.questionText': 'प्रश्न टेक्स्ट',
    'form.questionImage': 'प्रश्न छवि (वैकल्पिक)',
    'form.answerType': 'उत्तर प्रकार',
    'form.imageAnswers': 'छवि उत्तर',
    'form.addAnswer': 'उत्तर जोड़ें',
    'form.answerText': 'उत्तर टेक्स्ट',
    'form.questionImages': 'प्रश्न छवियां',
    'form.answerIcons': 'उत्तर आइकन छवियां',
    'form.image1': 'छवि 1',
    'form.image2': 'छवि 2',
    'form.rightIcon': 'सही आइकन छवि',
    'form.wrongIcon': 'गलत आइकन छवि',
    'form.addBothImages': 'कृपया सही/गलत प्रश्न के लिए दोनों छवियां जोड़ें',
    'form.addAllRightWrongImages': 'कृपया दोनों प्रश्न छवियां और दोनों उत्तर आइकन छवियां जोड़ें',
    'form.save': 'सहेजें',
    'form.cancel': 'रद्द करें',
    'form.saving': 'सहेज रहे हैं...',
    'form.enterQuestion': 'कृपया एक प्रश्न दर्ज करें',
    'form.addImageAnswers': 'कृपया कम से कम एक छवि उत्तर जोड़ें',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
