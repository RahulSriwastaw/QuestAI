import { create } from 'zustand';
import { Question } from '../types';
import { createSet } from '../services/setService';
import { supabase } from '../services/supabaseClient';

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
  filtered_questions: Question[];
  set_questions: Question[];
  visibility: 'private' | 'org_only' | 'public';
  isSaving: boolean;
  error: string | null;
  
  setStep: (step: 1 | 2 | 3 | 'success') => void;
  setField: (field: string, value: any) => void;
  setFilter: (filter: string, value: any) => void;
  fetchQuestions: () => Promise<void>;
  addToSet: (question: Question) => void;
  removeFromSet: (id: string) => void;
  reorderSet: (questions: Question[]) => void;
  createSet: () => Promise<void>;
  created_set: { id: string; set_id: string; questionIds: string[]; password: string } | null;
  reset: () => void;
}

export const useSetCreatorStore = create<SetCreatorStore>((set, get) => ({
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
  filtered_questions: [],
  set_questions: [],
  visibility: 'private',
  isSaving: false,
  error: null,
  created_set: null,

  setStep: (step) => set({ step }),
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setFilter: (filter, value) => set((state) => ({
    filters: { ...state.filters, [filter]: value }
  })),
  fetchQuestions: async () => {
    const { filters } = get();
    let query = supabase.from('bank_questions').select('*');
    
    if (filters.search_text) {
      // Querying JSONB field question_data for question_text
      query = query.ilike('question_data->>question_text', `%${filters.search_text}%`);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching questions:', error);
      set({ error: `Failed to fetch questions: ${error.message}` });
      return;
    }

    const mappedQuestions = (data || []).map(q => ({
      id: q.id,
      folderId: q.folder_id || null,
      savedAt: Number(q.saved_at),
      ...q.question_data
    }));

    set({ filtered_questions: mappedQuestions });
  },
  addToSet: (question) => set((state) => ({
    set_questions: [...state.set_questions, question]
  })),
  removeFromSet: (id) => set((state) => ({
    set_questions: state.set_questions.filter((q) => q.id !== id)
  })),
  reorderSet: (questions) => set({ set_questions: questions }),
  createSet: async () => {
    const { name, subject_id, chapter_id, description, set_questions, visibility } = get();
    try {
      set({ isSaving: true, error: null });
      
      const { data, error } = await supabase.from('sets').insert({
        name,
        subject_id,
        chapter_id,
        description,
        question_ids: set_questions.map(q => q.id), // Storing IDs instead of full objects for consistency
        visibility
      }).select().single();

      if (error) throw error;
      
      set({ 
        step: 'success',
        isSaving: false,
        created_set: { 
          id: data.id, 
          set_id: data.name,
          questionIds: data.question_ids || [], 
          password: 'N/A' 
        }
      });
    } catch (error: any) {
      console.error('Failed to create set:', error);
      set({ error: error.message, isSaving: false });
    }
  },
  reset: () => set({
    step: 1,
    name: '',
    set_questions: [],
    created_set: null
  }),
}));
