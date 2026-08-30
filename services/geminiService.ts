import { GoogleGenAI, Type } from "@google/genai";

// Note: In a real production app, this key should be proxied or strictly env controlled.
// The prompt instructions say to use process.env.API_KEY.
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API Key not found in environment. AI features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}


export const generateMonthlyQuotes = async (year: number): Promise<string[]> => {
  const ai = getClient();
  if (!ai) return Array(12).fill("A criatividade requer coragem.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere 12 frases motivacionais e inspiradoras em Português, uma para cada mês do ano de ${year}. As frases devem ser curtas (máximo 15 palavras) e adequadas para o cabeçalho de uma agenda profissional/estudantil. Retorne APENAS um array JSON de strings.`,
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
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length >= 12) {
        return parsed.slice(0, 12);
      }
    }
    return Array(12).fill("Planeje hoje para colher amanhã.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return Array(12).fill("A persistência é o caminho do êxito.");
  }
};

export const analyzeAgendaTheme = async (themeDescription: string): Promise<string> => {
     const ai = getClient();
     if (!ai) return "Sugestão indisponível (Sem API Key)";

     try {
         const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: `O usuário quer criar uma agenda com o seguinte tema ou estilo: "${themeDescription}". Sugira uma paleta de cores CSS (hex codes) e uma fonte do Google Fonts que combinaria. Formato curto e direto. Exemplo: "Cores: #F3F4F6, #1F2937. Fonte: Roboto."`
         });
         return response.text || "";
     } catch (e) {
         return "Erro ao analisar tema.";
     }
}
