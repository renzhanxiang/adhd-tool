import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const decomposeTaskWithAI = async (taskTitle: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning fallback steps.");
    return ["Start simply", "Do the first logical step", "Review progress"];
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Break down the following task into 3 to 6 small, actionable, and non-overwhelming steps for someone with ADHD. Keep steps concise. Task: "${taskTitle}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    const steps = JSON.parse(jsonStr) as string[];
    return steps;
  } catch (error) {
    console.error("Gemini decomposition failed:", error);
    // Fallback if API fails
    return ["Prepare materials", "Start the first part", "Take a short break", "Finish the rest"];
  }
};