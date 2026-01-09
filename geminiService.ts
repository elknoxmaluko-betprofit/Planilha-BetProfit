import { GoogleGenAI } from "@google/genai";
import { Bet } from "./types";

// Lazy initialization of the AI client
// This prevents the app from crashing on startup if process.env.API_KEY is not immediately available or if process is undefined during module evaluation.
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // process.env.API_KEY is replaced by Vite at build time via define
    const key = process.env.API_KEY;
    if (!key) {
      console.warn("API_KEY not found in environment variables.");
      // You might want to handle this gracefully in the UI
    }
    ai = new GoogleGenAI({ apiKey: key || 'DUMMY_KEY_TO_PREVENT_CRASH' });
  }
  return ai;
};

export const analyzeBets = async (bets: Bet[]) => {
  if (bets.length === 0) return "Adicione algumas apostas para receber uma análise IA da sua performance.";

  // type and odds now exist on Bet interface
  const betSummary = bets.map(b => ({
    type: b.type,
    odds: b.odds,
    stake: b.stake,
    profit: b.profit,
    status: b.status,
    event: b.event
  }));

  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      // Using gemini-3-pro-preview for complex reasoning and strategic analysis
      model: 'gemini-3-pro-preview',
      contents: `Analise as seguintes entradas de trading esportivo na Betfair Exchange e forneça insights estratégicos, pontos fortes e fracos: ${JSON.stringify(betSummary)}`,
      config: {
        systemInstruction: "Você é um especialista em trading esportivo e análise estatística de apostas. Seu objetivo é ajudar o usuário a identificar padrões lucrativos e erros comuns. Fale em português de Portugal/Brasil de forma profissional e motivadora.",
      }
    });

    // Directly access .text property
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Erro ao processar análise de IA. Verifique a sua chave de API.";
  }
};