import { Question } from '../types';

export interface CreateSetRequest {
  name: string;
  subject_id: string;
  chapter_id: string;
  description: string;
  questions: Question[];
  visibility: 'private' | 'org_only' | 'public';
}

export interface CreateSetResponse {
  id: string;
  set_id: string;
  password: string;
}

export const createSet = async (data: CreateSetRequest): Promise<CreateSetResponse> => {
  const response = await fetch('/api/sets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create set');
  }

  return response.json();
};
