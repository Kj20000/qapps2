export type AnswerType = 'yesno' | 'images' | 'rightwrong';
export type QuestionCategory = 'M' | 'E' | 'N' | string;

export interface ImageAnswer {
  id: string;
  image: string;
  text: string;
}

export interface RightWrongImages {
  image1: string;
  image2: string;
  rightIcon: string;
  wrongIcon: string;
}

export interface Question {
  id: string;
  text: string;
  image?: string;
  answerType: AnswerType;
  imageAnswers?: ImageAnswer[];
  rightWrongImages?: RightWrongImages;
  category: QuestionCategory;
}
