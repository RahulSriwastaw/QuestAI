
export interface Question {
  id: string;
  question_number: number;
  question_text: string;
  has_diagram: boolean;
  diagram_description?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
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
}

export interface ExtractionResult {
  total_questions: number;
  total_pages: number;
  questions_with_diagrams: number;
  questions: Question[];
}

export enum ProcessStep {
  IDLE = 'IDLE',
  LOADING_PDF = 'LOADING_PDF',
  CONVERTING_PAGES = 'CONVERTING_PAGES',
  EXTRACTING_DATA = 'EXTRACTING_DATA',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PageData {
  image: string; // base64
  pageNumber: number;
  width: number;
  height: number;
}
