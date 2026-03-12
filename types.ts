
export interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_hin?: string;
  question_eng?: string;
  has_diagram: boolean;
  diagram_description?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    A_hin?: string;
    B_hin?: string;
    C_hin?: string;
    D_hin?: string;
    A_eng?: string;
    B_eng?: string;
    C_eng?: string;
    D_eng?: string;
    A_diagram_bbox?: [number, number, number, number];
    B_diagram_bbox?: [number, number, number, number];
    C_diagram_bbox?: [number, number, number, number];
    D_diagram_bbox?: [number, number, number, number];
    A_diagram_url?: string;
    B_diagram_url?: string;
    C_diagram_url?: string;
    D_diagram_url?: string;
    A_diagram_alt_text?: string;
    B_diagram_alt_text?: string;
    C_diagram_alt_text?: string;
    D_diagram_alt_text?: string;
  };
  page_number: number;
  diagram_bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  diagram_url?: string;
  diagram_alt_text?: string;
  answer?: string;
  solution_hin?: string;
  solution_eng?: string;
  status?: 'active' | 'draft';
  refinementStatus?: 'pending' | 'final';
  tags?: string[];
}

export interface ExtractionResult {
  total_questions: number;
  total_pages: number;
  questions_with_diagrams: number;
  questions: Question[];
}

export interface QuestionSet {
  id: string;
  name: string;
  password?: string;
  questionIds: string[];
  createdAt: number;
}

export interface DocumentData {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'processed' | 'error';
  totalPages: number;
  questionsCount: number;
  createdAt: string;
  author: string;
  folderId?: string | null;
  pages?: PageData[];
  questions?: Question[];
}

export enum ProcessStep {
  IDLE = 'IDLE',
  LOADING_PDF = 'LOADING_PDF',
  CONVERTING_PAGES = 'CONVERTING_PAGES',
  SELECTING_PAGES = 'SELECTING_PAGES',
  EXTRACTING_DATA = 'EXTRACTING_DATA',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface BankQuestion extends Question {
  folderId: string | null;
  savedAt: number;
}

export interface PageData {
  image: string; // base64
  pageNumber: number;
  width: number;
  height: number;
}
