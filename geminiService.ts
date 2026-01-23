import { GoogleGenAI } from "@google/genai";
import { Bet } from "./types";

// Lazy initialization of the AI client
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // API key must be obtained exclusively from process.env.API_KEY
    // Assume process.env.API_KEY is pre-configured and valid
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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