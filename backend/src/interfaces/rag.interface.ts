export interface MaterialData {
  type: 'file';
  content: string;
}

export interface RagQuery {
  question: string;
}

export interface RagResponse {
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface LearningReport {
  report: string;
}
