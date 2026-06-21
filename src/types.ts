export interface Meaning {
  pos: string;
  zhDef: string;
  engDef: string;
}

export interface ExampleSentence {
  eng: string;
  zht: string;
  tag: string;
}

export interface WordEntry {
  word: string;
  phonetic: string;
  toeicFreq: 'high' | 'medium' | 'low' | string;
  meanings: Meaning[];
  examples: ExampleSentence[];
  collocations?: string[];
  rootAnalysis?: string;
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: 'A' | 'B' | 'C' | 'D' | string;
  translation: string;
  explanation: string;
  skill: string;
  difficulty: string;
  vocabTips?: string[];
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  questionText: string;
  chosenAnswer: string;
  correctAnswer: string;
  correct: boolean;
  skill: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
}

export interface StudentProfile {
  targetScore: number;
  dailyMinutes: number;
  examDate: string;
}

export interface DiagnosticSummary {
  weaknesses: string[];
  nextTasks: string[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
