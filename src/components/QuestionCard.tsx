import { useEffect, useState } from "react";
import { Question } from "@/types/question";
import { speak } from "@/lib/speech";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

const QuestionCard = ({ question, onAnswer }: QuestionCardProps) => {
  const { t, language } = useLanguage();

  // Selection animation state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Image enlarge animation state
  const [imageEnlarged, setImageEnlarged] = useState(false);

  useEffect(() => {
    setSelectedId(null);
    setImageEnlarged(false);
    
    // Speak and then trigger image animation
    const utterance = speak(question.text);
    if (utterance) {
      utterance.onend = () => setImageEnlarged(true);
    } else {
      // Fallback if speech not available
      setTimeout(() => setImageEnlarged(true), 1500);
    }
  }, [question.id, question.text]);

  const handleAnswer = (answer: string, id?: string) => {
    setSelectedId(id || null);
    speak(answer);
    onAnswer(answer);
  };

  const handleListenAgain = () => {
    setSelectedId(null); // Reset selection to enable all buttons again
    speak(question.text);
  };

  const listenAgainText = language === "hi" ? "फिर से सुनें" : "Listen again";

  /* AUTO COLUMN LOGIC */
  const count = question.imageAnswers?.length || 2;
  const gridCols =
    count === 1 ? "grid-cols-1"
    : count === 2 ? "grid-cols-2"
    : count === 3 ? "grid-cols-3"
    : "grid-cols-4";

  return (
    <Card
      className="
        w-full max-w-6xl mx-auto p-4 md:p-8
        landscape:min-h-[75vh]   /* Landscape fit */
        /* Portrait = natural height */
        bg-gradient-to-br from-card via-card to-primary/5
        shadow-[var(--shadow-elevated)] border-2 border-primary/20 
        animate-fade-in"
    >
      <div className="space-y-6">

        {/* QUESTION HEADER */}
        <div
          className="flex flex-row items-center gap-4 md:gap-6
          bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10
          p-4 md:p-6 rounded-2xl animate-scale-in"
          style={{ animationDelay: "0.1s" }}
        >
          {question.image && (
            <div
              className={`
                flex-shrink-0 rounded-xl overflow-hidden border-3 shadow-[var(--shadow-soft)]
                transition-all duration-700 ease-out
                ${imageEnlarged 
                  ? 'w-32 h-32 md:w-44 md:h-44 border-primary/50 shadow-[0_0_30px_5px_rgba(var(--primary),0.3)] scale-105 z-10' 
                  : 'w-24 h-24 md:w-32 md:h-32 border-primary/30'}
              `}
            >
              <img
                src={question.image}
                alt="Question"
                className="w-full h-full object-contain bg-white"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-2 md:mb-3 leading-tight">
              {question.text}
            </h1>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleListenAgain}
              className="text-primary hover:text-primary hover:bg-primary/10 h-8 md:h-10"
            >
              <Volume2 className="w-5 h-5 md:w-6 md:h-6 mr-1 md:mr-2" />
              <span className="text-sm md:text-lg">{listenAgainText}</span>
            </Button>
          </div>
        </div>

        {/* ANSWERS */}
        <div
          className="pt-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          {question.answerType === "yesno" ? (
            /* YES / NO BUTTONS */
            <div className="flex flex-row gap-6 md:gap-12 lg:gap-16 w-full justify-center items-stretch">

              {/* YES BUTTON */}
              <Button
                variant="default"
                size="lg"
                onClick={() => handleAnswer(t("app.yes"), "yes")}
                disabled={selectedId !== null && selectedId !== "yes"}
                className={`
                  flex-1 max-w-md h-28 md:h-36 lg:h-40 
                  text-3xl md:text-5xl lg:text-6xl font-bold
                  bg-gradient-to-br from-success to-success/80
                  text-success-foreground shadow-[var(--shadow-glow)]
                  transition-all animate-scale-in

                  ${
                    selectedId === "yes"
                      ? "scale-110 z-20 border-4 border-primary shadow-[0_0_25px_5px_rgba(0,150,255,0.7)] animate-pulse"
                      : selectedId !== null
                      ? "opacity-40 grayscale cursor-not-allowed"
                      : "hover:scale-105"
                  }
                `}
                style={{ animationDelay: "0.4s" }}
              >
                {t("app.yes")}
              </Button>

              {/* NO BUTTON */}
              <Button
                variant="default"
                size="lg"
                onClick={() => handleAnswer(t("app.no"), "no")}
                disabled={selectedId !== null && selectedId !== "no"}
                className={`
                  flex-1 max-w-md h-28 md:h-36 lg:h-40
                  text-3xl md:text-5xl lg:text-6xl font-bold
                  bg-gradient-to-br from-destructive to-destructive/80
                  text-destructive-foreground shadow-[var(--shadow-glow)]
                  transition-all animate-scale-in

                  ${
                    selectedId === "no"
                      ? "scale-110 z-20 border-4 border-primary shadow-[0_0_25px_5px_rgba(0,150,255,0.7)] animate-pulse"
                      : selectedId !== null
                      ? "opacity-40 grayscale cursor-not-allowed"
                      : "hover:scale-105"
                  }
                `}
                style={{ animationDelay: "0.5s" }}
              >
                {t("app.no")}
              </Button>

            </div>
          ) : question.answerType === "rightwrong" ? (
            /* RIGHT / WRONG WITH TWO IMAGES */
            <div className="space-y-6">
              {/* TWO IMAGES */}
              <div className="grid grid-cols-2 gap-6 w-full">
                {question.rightWrongImages?.image1 && (
                  <div className="rounded-2xl overflow-hidden border-3 border-border shadow-lg animate-scale-in"
                    style={{ animationDelay: "0.4s" }}>
                    <img
                      src={question.rightWrongImages.image1}
                      alt="Option 1"
                      className="w-full h-64 md:h-80 object-contain bg-white"
                    />
                  </div>
                )}
                {question.rightWrongImages?.image2 && (
                  <div className="rounded-2xl overflow-hidden border-3 border-border shadow-lg animate-scale-in"
                    style={{ animationDelay: "0.5s" }}>
                    <img
                      src={question.rightWrongImages.image2}
                      alt="Option 2"
                      className="w-full h-64 md:h-80 object-contain bg-white"
                    />
                  </div>
                )}
              </div>

              {/* RIGHT / WRONG BUTTONS */}
              <div className="flex flex-row gap-6 md:gap-12 lg:gap-16 w-full justify-center items-stretch">
                {/* RIGHT BUTTON */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleAnswer(t("app.right"), "right")}
                  disabled={selectedId !== null && selectedId !== "right"}
                  className={`
                    flex-1 max-w-md h-28 md:h-36 lg:h-40 
                    bg-gradient-to-br from-green-500 to-green-600
                    text-white shadow-[var(--shadow-glow)]
                    transition-all animate-scale-in
                    flex items-center justify-center p-4

                    ${
                      selectedId === "right"
                        ? "scale-110 z-20 border-4 border-primary shadow-[0_0_25px_5px_rgba(0,150,255,0.7)] animate-pulse"
                        : selectedId !== null
                        ? "opacity-40 grayscale cursor-not-allowed"
                        : "hover:scale-105"
                    }
                  `}
                  style={{ animationDelay: "0.6s" }}
                >
                  {question.rightWrongImages?.rightIcon ? (
                    <img 
                      src={question.rightWrongImages.rightIcon} 
                      alt="Right" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Check className="w-16 h-16 md:w-20 md:h-20 stroke-[4]" />
                  )}
                </Button>

                {/* WRONG BUTTON */}
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleAnswer(t("app.wrong"), "wrong")}
                  disabled={selectedId !== null && selectedId !== "wrong"}
                  className={`
                    flex-1 max-w-md h-28 md:h-36 lg:h-40
                    bg-gradient-to-br from-red-500 to-red-600
                    text-white shadow-[var(--shadow-glow)]
                    transition-all animate-scale-in
                    flex items-center justify-center p-4

                    ${
                      selectedId === "wrong"
                        ? "scale-110 z-20 border-4 border-primary shadow-[0_0_25px_5px_rgba(0,150,255,0.7)] animate-pulse"
                        : selectedId !== null
                        ? "opacity-40 grayscale cursor-not-allowed"
                        : "hover:scale-105"
                    }
                  `}
                  style={{ animationDelay: "0.7s" }}
                >
                  {question.rightWrongImages?.wrongIcon ? (
                    <img 
                      src={question.rightWrongImages.wrongIcon} 
                      alt="Wrong" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <X className="w-16 h-16 md:w-20 md:h-20 stroke-[4]" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* IMAGE OPTIONS */
            <div className={`grid ${gridCols} gap-4 w-full`}>
              {question.imageAnswers?.map((answer, index) => (
                <Button
                  key={answer.id}
                  variant="outline"
                  onClick={() => handleAnswer(answer.text, answer.id)}
                  disabled={selectedId !== null && selectedId !== answer.id}
                  className={`
                    h-64 md:h-72 lg:h-80
                    landscape:h-[45vh]
                    p-0 overflow-hidden border-3 rounded-2xl
                    flex flex-col shadow-lg transition-all animate-scale-in

                    ${
                      selectedId === answer.id
                        ? "scale-110 z-20 border-4 border-primary shadow-[0_0_25px_5px_rgba(0,150,255,0.7)] animate-pulse"
                        : selectedId !== null
                        ? "opacity-40 grayscale cursor-not-allowed"
                        : "hover:scale-105 border-border"
                    }
                  `}
                  style={{
                    background: `linear-gradient(135deg, hsl(${
                      index * 60
                    } 70% 95%), hsl(${index * 60 + 30} 65% 92%))`,
                    animationDelay: `${0.4 + index * 0.1}s`,
                  }}
                >
                  <div className="w-full h-4/5 flex items-center justify-center bg-white overflow-hidden">
                    {answer.image ? (
                      <img
                        src={answer.image}
                        alt={answer.text}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-4xl md:text-5xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-white/90 text-center">
                    <p className="text-lg md:text-xl font-bold text-foreground">
                      {answer.text}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
