import { create } from 'zustand';
import { Question } from '../types';

interface SetCreatorStore {
  step: 1 | 2 | 3 | 'success';
  name: string;
  subject_id: string;
  chapter_id: string;
  description: string;
  creation_mode: 'browse' | 'ai' | 'import';
  filters: {
    exam_ids: string[];
    subject_ids: string[];
    chapter_ids: string[];
    years: number[];
    difficulties: string[];
    types: string[];
    mode: 'prev_year' | 'prev_year_related' | 'all';
    search_text: string;
  };
  set_questions: Question[];
  visibility: 'private' | 'org_only' | 'public';
  
  setStep: (step: 1 | 2 | 3 | 'success') => void;
  setField: (field: string, value: any) => void;
  setFilter: (filter: string, value: any) => void;
  addToSet: (question: Question) => void;
  removeFromSet: (id: string) => void;
  reorderSet: (questions: Question[]) => void;
  reset: () => void;
}

export const useSetCreatorStore = create<SetCreatorStore>((set) => ({
  step: 1,
  name: '',
  subject_id: '',
  chapter_id: '',
  description: '',
  creation_mode: 'browse',
  filters: {
    exam_ids: [],
    subject_ids: [],
    chapter_ids: [],
    years: [],
    difficulties: [],
    types: [],
    mode: 'prev_year',
    search_text: '',
  },
  set_questions: [],
  visibility: 'private',

  setStep: (step) => set({ step }),
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setFilter: (filter, value) => set((state) => ({
    filters: { ...state.filters, [filter]: value }
  })),
  addToSet: (question) => set((state) => ({
    set_questions: [...state.set_questions, question]
  })),
  removeFromSet: (id) => set((state) => ({
    set_questions: state.set_questions.filter((q) => q.id !== id)
  })),
  reorderSet: (questions) => set({ set_questions: questions }),
  reset: () => set({
    step: 1,
    name: '',
    set_questions: [],
  }),
}));
