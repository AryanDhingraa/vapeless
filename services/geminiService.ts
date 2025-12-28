import { GoogleGenAI } from "@google/genai";
import { UserSettings, PuffLog } from "../types.ts";

// Lazy-loaded AI instance to prevent initialization crashes
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    // Safely access process.env.API_KEY
    const apiKey = (window as any).process?.env?.API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getCoachResponse = async (
  message: string,
  settings: UserSettings,
  recentPuffs: PuffLog[]
) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The user wants help quitting vaping. 
      Settings: Cost per pod $${settings.podCost}, Puffs per pod: ${settings.puffsPerPod}, Nicotine: ${settings.nicotineStrength}mg.
      Total puffs logged recently: ${recentPuffs.length}.
      User message: ${message}`,
      config: {
        systemInstruction: `You are an empathetic, supportive, and data-driven addiction recovery coach named "VapeLess AI". 
        Your goal is to help users quit vaping. Use the provided user data to give personalized advice.
        Be concise, positive, and non-judgmental. If they report a craving, suggest a 2-minute distraction.
        Focus on health benefits and money saved.`,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (e) {
    console.error("Coach API Error:", e);
    return "STAY STRONG. YOU CAN DO THIS.";
  }
};

export const getDailyInsight = async (puffs: PuffLog[], settings: UserSettings) => {
  try {
    const ai = getAI();
    const today = new Date().setHours(0,0,0,0);
    const todayPuffs = puffs.filter(p => p.timestamp >= today).length;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this: The user had ${todayPuffs} puffs today. Their daily goal is to stay under ${settings.dailyBudget} puffs. Give a one-sentence motivation.`,
      config: {
        systemInstruction: "You are a health data analyst. Provide a single, punchy motivational sentence based on the user's progress."
      }
    });

    return response.text;
  } catch (e) {
    console.error("Insight API Error:", e);
    return "EVERY PUFF NOT TAKEN IS A WIN.";
  }
};