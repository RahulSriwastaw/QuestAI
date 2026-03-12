import { GoogleGenAI, Type } from "@google/genai";

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

export async function extractQuestionsFromPage(imageBase64: string, pageNumber: number) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-latest",
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64.split(',')[1] || imageBase64
        }
      },
      {
        text: `Extract all multiple choice questions from this page (Page ${pageNumber}). 
        Return a JSON array of questions. Each question should have:
        - question_number: number
        - question_text: string
        - options: { A: string, B: string, C: string, D: string }
        - has_diagram: boolean
        - diagram_bbox: [ymin, xmin, ymax, xmax] (normalized 0-1000, if has_diagram is true)`
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_number: { type: Type.NUMBER },
            question_text: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ["A", "B", "C", "D"]
            },
            has_diagram: { type: Type.BOOLEAN },
            diagram_bbox: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            }
          },
          required: ["question_number", "question_text", "options", "has_diagram"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse extraction response:", e);
    return [];
  }
}

export async function performOCR(imageUrl: string) {
  // For simplicity, we'll just return a placeholder or try to fetch and OCR
  // In a real app, you'd fetch the image and send it to Gemini
  return "Diagram description";
}

export async function suggestLayout(elements: any[], width: number, height: number) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-latest",
    contents: `Suggest a better layout for these design elements on a ${width}x${height} canvas. 
    Maintain the content but optimize their positions (x, y) for a professional look.
    Elements: ${JSON.stringify(elements.map(el => ({ id: el.id, type: el.type, width: el.width, height: el.height })))}
    Return a JSON array of objects with { id, x, y }.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER }
          },
          required: ["id", "x", "y"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse layout suggestion:", e);
    return [];
  }
}
export async function generateDesignElements(prompt: string) {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-latest",
    contents: `Generate a list of design elements based on this prompt: "${prompt}". 
    The output must be a JSON array of elements. Each element should follow this structure:
    {
      "type": "text" | "shape",
      "text": string (for text type),
      "fontSize": number (for text type),
      "fontFamily": string (for text type),
      "fill": string (hex color),
      "shapeType": "rect" | "circle" | "triangle" (for shape type),
      "x": number,
      "y": number,
      "width": number,
      "height": number
    }
    Assume a canvas size of 794x1123.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            text: { type: Type.STRING },
            fontSize: { type: Type.NUMBER },
            fontFamily: { type: Type.STRING },
            fill: { type: Type.STRING },
            shapeType: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            width: { type: Type.NUMBER },
            height: { type: Type.NUMBER },
          },
          required: ["type", "x", "y", "width", "height"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}

export async function generateCurrentAffairsQuestions(
  date: string,
  topic: string,
  count: number,
  language: string
) {
  const prompt = `Generate ${count} multiple-choice questions about current affairs for the timeframe: ${date}. 
  ${topic ? `Focus on the topic: ${topic}.` : 'Cover a mix of important national and international news.'}
  The language of the questions and options should be ${language}.
  
  Return a JSON array of questions. Each question must have:
  - question_number: number (starting from 1)
  - question_text: string
  - options: { A: string, B: string, C: string, D: string }
  - answer: string (the correct option letter: A, B, C, or D)
  - solution_${language === 'Hindi' ? 'hin' : 'eng'}: string (detailed explanation of the answer)
  - has_diagram: false`;

  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_number: { type: Type.NUMBER },
            question_text: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ["A", "B", "C", "D"]
            },
            answer: { type: Type.STRING },
            solution_hin: { type: Type.STRING },
            solution_eng: { type: Type.STRING },
            has_diagram: { type: Type.BOOLEAN }
          },
          required: ["question_number", "question_text", "options", "answer", "has_diagram"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text);
}
