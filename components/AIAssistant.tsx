
import React, { useState } from 'react';
import { Bet } from '../types';
import { analyzeBets } from '../services/geminiService';

interface AIAssistantProps {
  bets: Bet[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ bets }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setShowModal(true);
    const result = await analyzeBets(bets);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <>
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <i className="fas fa-robot text-yellow-400"></i> IA Mentor
        </h4>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">Analise o seu histórico para identificar erros e padrões lucrativos.</p>
        <button 
          onClick={handleAnalyze}
          disabled={loading || bets.length === 0}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-all"
        >
          {loading ? 'A pensar...' : 'Obter Insights'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <i className="fas fa-brain text-yellow-400"></i> Análise de Performance IA
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
                  <p className="text-slate-400 animate-pulse">O mentor está a processar os seus dados...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-yellow max-w-none">
                  {analysis?.split('\n').map((line, i) => (
                    <p key={i} className="text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-2 rounded-xl font-bold transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
