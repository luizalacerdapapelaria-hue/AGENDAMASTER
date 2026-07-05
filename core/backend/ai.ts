import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export const generateMonthlyQuotes = async (year: number): Promise<string[]> => {
  const ai = getClient();
  if (!ai) return Array(12).fill("A criatividade requer coragem.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere 12 frases motivacionais para ${year}. Array JSON de strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });

    const jsonStr = response.text;
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) return parsed.slice(0, 12);
    }
    return Array(12).fill("Planeje hoje para colher amanhã.");
  } catch (error) {
    return Array(12).fill("A persistência é o caminho do êxito.");
  }
};