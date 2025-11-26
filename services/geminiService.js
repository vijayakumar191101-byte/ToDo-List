import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSubtasks = async (taskTitle) => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return ["Breakdown unavailable (Missing API Key)", "Check configuration"];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the task "${taskTitle}" into 3 to 5 clear, actionable subtasks.`,
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

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const enhanceTaskDescription = async (rawInput) => {
   if (!apiKey) return rawInput;
   
   try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: `Rewrite this task to be more concise and actionable: "${rawInput}". Return only the text.`,
     });
     return response.text?.trim() || rawInput;
   } catch (error) {
     return rawInput;
   }
}