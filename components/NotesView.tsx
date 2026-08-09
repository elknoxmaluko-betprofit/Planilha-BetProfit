import React, { useMemo, useState, useEffect } from 'react';
import { Bet } from '../types';

interface NotesViewProps {
  bets: Bet[];
  onUpdateBet: (id: string, updates: Partial<Bet>) => void;
  currency: string;
  availableTags: string[];
}

const NotesView: React.FC<NotesViewProps> = ({ bets, onUpdateBet, currency, availableTags }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('betprofit_notes_selected_tags');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [showTags, setShowTags] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('betprofit_notes_selected_tags', JSON.stringify(selectedTags));
  }, [selectedTags]);

  // Sort bets by date descending and filter by tags
  const sortedBets = useMemo(() => {
    let filtered = bets;
    if (selectedTags.length > 0) {
      filtered = bets.filter(bet => bet.tags && selectedTags.some(tag => bet.tags!.includes(tag)));
    }
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bets, selectedTags]);

  const getEvaluationColor = (evaluation?: string) => {
    if (evaluation === 'OK') return 'bg-emerald-500/80 text-white';
    if (evaluation === 'RUIM') return 'bg-orange-500/80 text-white';
    if (evaluation === 'PÉSSIMO') return 'bg-red-600/80 text-white';
    return 'bg-transparent text-slate-300';
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'bg-emerald-500/20 text-emerald-400';
    if (profit < 0) return 'bg-red-500/40 text-red-300';
    return 'text-slate-300';
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${d.getDate()}/${months[d.getMonth()]}`;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col bg-slate-900 text-xs font-sans border-t border-slate-700">
      
      {/* Filters */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowTags(!showTags)}>
            <i className={`fas fa-chevron-${showTags ? 'up' : 'down'} text-slate-400`}></i>
            <span className="text-white font-bold uppercase tracking-wider text-[10px]">Filtrar por Tags</span>
            {selectedTags.length > 0 && (
              <span className="bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {selectedTags.length}
              </span>
            )}
          </div>
        </div>

        {showTags && (
          <div className="flex flex-wrap items-center gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedTags.includes(tag) ? 'bg-yellow-400 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200'}`}
              >
                {tag}
              </button>
            ))}
            {availableTags.length === 0 && (
              <span className="text-slate-500 italic text-xs">Nenhuma tag registada</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-slate-900">
        <table className="w-full border-collapse whitespace-nowrap min-w-[1200px]">
          <thead className="sticky top-0 bg-slate-900 z-10 text-white font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center min-w-[200px]">Jogo</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center w-20">Data</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center min-w-[150px]">Competição</th>
              <th colSpan={2} className="border border-slate-700 p-2 text-center">Resultado</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center">Momento de Operação</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center">PL</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center min-w-[200px]">Forma de Red - Operacional</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center min-w-[200px]">Forma do Gol - Como Foi</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center">Momento do Gol</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center">Avaliação</th>
              <th rowSpan={2} className="border border-slate-700 p-2 text-center min-w-[300px] w-full">Anotações</th>
            </tr>
            <tr>
              <th className="border border-slate-700 p-1 text-center w-12">Casa</th>
              <th className="border border-slate-700 p-1 text-center w-12">Fora</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900">
            {sortedBets.map((bet) => (
              <tr key={bet.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="border border-slate-700 p-1 text-slate-200 text-center truncate px-2">{bet.event}</td>
                <td className="border border-slate-700 p-1 text-slate-200 text-center">{formatShortDate(bet.date)}</td>
                <td className="border border-slate-700 p-1 text-slate-200 text-center truncate px-2">{bet.league || '-'}</td>
                
                <td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.homeScore || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { homeScore: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>
                <td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.awayScore || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { awayScore: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>
                
                <td className="border border-slate-700 p-0 text-center">
                  <select
                    value={bet.operationMoment || ''}
                    onChange={(e) => onUpdateBet(bet.id, { operationMoment: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-300">-</option>
                    <option value="HT" className="bg-slate-900 text-white">HT</option>
                    <option value="FT" className="bg-slate-900 text-white">FT</option>
                    <option value="Prolongamento" className="bg-slate-900 text-white">Prolongamento</option>
                  </select>
                </td>
                
                <td className={`border border-slate-700 p-1 text-center font-bold ${getProfitColor(bet.profit)}`}>
                  {bet.profit >= 0 ? '+' : ''}{bet.profit.toFixed(2)} {currency}
                </td>
                
                <td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.redForm || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { redForm: e.target.value })}
                    className="w-full h-full p-1 px-2 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>
                
                <td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.goalForm || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { goalForm: e.target.value })}
                    className="w-full h-full p-1 px-2 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>
                
                <td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.goalMoment || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { goalMoment: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>
                
                <td className={`border border-slate-700 p-0 text-center ${getEvaluationColor(bet.evaluation)}`}>
                  <select
                    value={bet.evaluation || ''}
                    onChange={(e) => onUpdateBet(bet.id, { evaluation: e.target.value as 'OK' | 'RUIM' | 'PÉSSIMO' | '' })}
                    className={`w-full h-full p-1 bg-transparent outline-none appearance-none text-center cursor-pointer`}
                  >
                    <option value="" className="bg-slate-900 text-slate-300">-</option>
                    <option value="OK" className="bg-slate-900 text-emerald-400">OK</option>
                    <option value="RUIM" className="bg-slate-900 text-orange-400">RUIM</option>
                    <option value="PÉSSIMO" className="bg-slate-900 text-red-500">PÉSSIMO</option>
                  </select>
                </td>
                
                <td className="border border-slate-700 p-0 text-left">
                  <input 
                    type="text" 
                    value={bet.notes || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { notes: e.target.value })}
                    className="w-full h-full p-1 px-2 bg-transparent text-slate-200 outline-none focus:bg-slate-800"
                    placeholder="Adicionar anotação..."
                  />
                </td>
              </tr>
            ))}
            {sortedBets.length === 0 && (
              <tr>
                <td colSpan={12} className="border border-slate-700 p-8 text-center text-slate-500 italic bg-slate-900">
                  Nenhuma aposta encontrada no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotesView;
