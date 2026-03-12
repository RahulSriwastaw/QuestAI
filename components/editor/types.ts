export type ElementType = 'text' | 'image' | 'shape' | 'question_block' | 'table';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  zIndex: number;
  groupId?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  align: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  cornerRadius: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'star' | 'triangle';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface QuestionBlockElement extends BaseElement {
  type: 'question_block';
  questionId: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  diagramUrl?: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
  cellStyles?: {
    [key: string]: {
      fill?: string;
      fontSize?: number;
      fontWeight?: string;
      align?: 'left' | 'center' | 'right';
    };
  };
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | QuestionBlockElement | TableElement;

export interface Page {
  id: string;
  elements: CanvasElement[];
  background: string;
}

export interface DocumentState {
  id: string;
  title: string;
  pages: Page[];
  width: number;
  height: number;
}
