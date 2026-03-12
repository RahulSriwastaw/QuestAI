import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function bulkEditQuestions(questions: Question[], instruction: string): Promise<{ updatedQuestions: Question[], errors: string[] }> {
  const updatedQuestions: Question[] = [];
  const errors: string[] = [];

  // Batching: 20 questions at a time
  for (let i = 0; i < questions.length; i += 20) {
    const batch = questions.slice(i, i + 20);
    
    // Process each question in the batch
    const batchResults = await Promise.all(batch.map(async (q) => {
      try {
        return await processSingleQuestion(q, instruction);
      } catch (error: any) {
        console.error(`Error processing question ${q.id}:`, error);
        errors.push(`Question ${q.question_number || q.id}: ${error.message}`);
        return null;
      }
    }));
    
    // Filter out null results (failed questions)
    updatedQuestions.push(...batchResults.filter((q): q is Question => q !== null));
  }

  return { updatedQuestions, errors };
}

async function processSingleQuestion(q: Question, instruction: string): Promise<Question> {
  const prompt = `You are an expert exam content editor.

Apply the following instruction to the given question while keeping the correct answer unchanged.

Instruction:
${instruction}

Question Data:
${JSON.stringify({
  question_hin: q.question_hin,
  question_eng: q.question_eng,
  options: q.options,
  answer: q.answer,
  solution_hin: q.solution_hin,
  solution_eng: q.solution_eng
})}

Return updated fields in JSON format:
{
  "question_hin": "string",
  "question_eng": "string",
  "options": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string",
    "A_hin": "string",
    "B_hin": "string",
    "C_hin": "string",
    "D_hin": "string",
    "A_eng": "string",
    "B_eng": "string",
    "C_eng": "string",
    "D_eng": "string"
  },
  "solution_hin": "string",
  "solution_eng": "string"
}`;

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question_hin: { type: Type.STRING },
            question_eng: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
                A_hin: { type: Type.STRING },
                B_hin: { type: Type.STRING },
                C_hin: { type: Type.STRING },
                D_hin: { type: Type.STRING },
                A_eng: { type: Type.STRING },
                B_eng: { type: Type.STRING },
                C_eng: { type: Type.STRING },
                D_eng: { type: Type.STRING },
              }
            },
            solution_hin: { type: Type.STRING },
            solution_eng: { type: Type.STRING },
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const updatedData = JSON.parse(response.text);
    
    return {
      ...q,
      question_hin: updatedData.question_hin || q.question_hin,
      question_eng: updatedData.question_eng || q.question_eng,
      options: {
        ...q.options,
        ...updatedData.options
      },
      solution_hin: updatedData.solution_hin || q.solution_hin,
      solution_eng: updatedData.solution_eng || q.solution_eng
    };
  } catch (error: any) {
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
