import { GoogleGenAI } from "@google/genai";
import { FoodItem } from "../types";

// Helper to safely get the AI instance. 
// Note: In a real app, you might want to initialize this once, but strictly adhering 
// to instructions regarding API key handling inside components or hooks is safer for demo.
const getAI = () => {
  // Ideally this comes from env vars
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateDishDescription = async (item: FoodItem): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI services unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, mouth-watering, 1-sentence social media caption for a food item named "${item.name}" which is described as "${item.description}". Use emojis.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Delicious food waiting for you!";
  }
};

export const analyzeHealthScore = async (item: FoodItem): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Health analysis unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the healthiness of "${item.name}" (${item.description}) in 30 words or less. Be objective.`,
    });
    return response.text.trim();
  } catch (error) {
    return "Could not analyze.";
  }
}
