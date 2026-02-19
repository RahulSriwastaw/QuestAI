
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Rate limiting configuration
const MAX_CONCURRENT_REQUESTS = 10;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRIES = 5;

class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private activeRequests = 0;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeRequests >= MAX_CONCURRENT_REQUESTS || this.queue.length === 0) {
      return;
    }

    this.activeRequests++;
    const task = this.queue.shift();

    if (task) {
      try {
        await task();
      } finally {
        this.activeRequests--;
        this.processQueue();
      }
    }
  }
}

const requestQueue = new RequestQueue();

async function retryWithBackoff<T>(operation: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota'))) {
      console.warn(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

const SYSTEM_INSTRUCTION = `You are an elite academic document analyzer. Your task is to extract MCQ questions from test papers with high precision.
CRITICAL RULES:
1. Every question on the page must be extracted.
2. Extract the question number and the full question text.
3. Use LaTeX (e.g., $E=mc^2$) for ALL mathematical and scientific notation.
4. Extract all 4 options (A, B, C, D).
5. DIAGRAM DETECTION (CRITICAL): 
   - Some questions have a main diagram before or after the question text.
   - OTHER questions have diagrams INSIDE THE OPTIONS (e.g., Option A is a specific geometric shape).
   - If an option is a diagram (or contains a diagram), you MUST provide a tight 'diagram_bbox' for that option.
   - If there is no text in the option, use a descriptive placeholder like "Figure A" or "Correct pattern" in the text field.
6. COORDINATES: Bounding boxes must be [ymin, xmin, ymax, xmax] in normalized 0-1000 format. They must be extremely tight, capturing only the visual content.
7. Support Hindi (Devanagari) text perfectly. If the paper is bilingual, extract the primary language or both if they are distinct questions.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question_number: { type: Type.NUMBER },
          question_text: { type: Type.STRING },
          has_diagram: { type: Type.BOOLEAN },
          diagram_description: { type: Type.STRING },
          diagram_bbox: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "BBox for the main question diagram [ymin, xmin, ymax, xmax]."
          },
          options: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
              A_diagram_bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              B_diagram_bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              C_diagram_bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              D_diagram_bbox: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            },
            required: ["A", "B", "C", "D"]
          }
        },
        required: ["question_number", "question_text", "has_diagram", "options"]
      }
    }
  },
  required: ["questions"]
};

export const getApiKey = (): string => {
  return (
    import.meta.env.VITE_API_KEY ||
    localStorage.getItem('gemini_api_key') ||
    ''
  );
};

export async function extractQuestionsFromPage(
  base64Image: string,
  pageNumber: number
): Promise<Question[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found. Please configure it in settings.");

  const ai = new GoogleGenAI({ apiKey });

  return requestQueue.add(async () => {
    return retryWithBackoff(async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
              { text: "Extract all questions. Look closely at the area below each question for option-specific diagrams. If an option choice is an image/figure, provide its bbox. Ensure tight bboxes for all visual elements." }
            ]
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA
          }
        });

        const text = response.text;
        if (!text) return [];

        const data = JSON.parse(text);
        return (data.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: `p${pageNumber}-q${idx}-${Date.now()}`,
          page_number: pageNumber
        }));
      } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
      }
    });
  });
}

export async function performOCR(base64Image: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found. Please configure it in settings.");

  const ai = new GoogleGenAI({ apiKey });

  return requestQueue.add(async () => {
    return retryWithBackoff(async () => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: 'image/png' } },
              { text: "Extract all text from this diagram. If there is no text, describe the visual elements briefly. Be concise." }
            ]
          },
          config: {
            systemInstruction: "You are an OCR and image analysis expert. Your goal is to provide a text representation of the visual information in the image.",
            temperature: 0.1,
          }
        });

        return response.text || "";
      } catch (error) {
        console.error("OCR Error:", error);
        throw error; // Re-throw for retry mechanism
      }
    });
  });
}
