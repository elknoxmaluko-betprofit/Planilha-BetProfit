
import React, { useState } from 'react';
import { Bet, BetStatus, BetType } from '../types';

interface BetListProps {
  bets: Bet[];
  onDelete: (id: string) => void;
  onUpdateBet: (id: string, updates: Partial<Bet>) => void;
  monthlyStake: number;
  availableMethodologies: string[];
  availableTags: string[];
  availableLeagues?: string[];
  availableTeams?: string[];
  currency: string;
}

const BetList: React.FC<BetListProps> = ({ 
  bets, 
  onDelete, 
  onUpdateBet, 
  monthlyStake, 
  availableMethodologies, 
  availableTags,
  availableLeagues = [],
  availableTeams = [] ,
  currency
}) => {
  const [openTagMenuId, setOpenTagMenuId] = useState<string | null>(null);

  const handleToggleTag = (bet: Bet, tag: string) => {
    const currentTags = bet.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onUpdateBet(bet.id, { tags: newTags });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-visible shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800">
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Operação</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Mercado / Camp.</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Método / Tags</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-center tracking-[0.2em]">Stake</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-right tracking-[0.2em]">P/L</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-right tracking-[0.2em]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {bets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-28 text-center text-slate-500 italic text-lg">Sem registos para mostrar neste período.</td>
              </tr>
            ) : (
              bets.map(bet => (
                <tr key={bet.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="text-xs text-slate-500 font-black mb-1.5">{new Date(bet.date).toLocaleDateString('pt-PT')}</div>
                    <div className="font-black text-white text-base">{bet.event}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-400 bg-slate-800 self-start px-3 py-1 rounded-lg border border-slate-700 font-bold">{bet.market}</span>
                      <select 
                        className="bg-slate-800/50 text-xs text-blue-400 font-black uppercase outline-none border border-slate-700/50 px-3 py-1 rounded-lg cursor-pointer hover:border-blue-400/50 transition-all appearance-none"
                        value={bet.league || ''}
                        onChange={(e) => onUpdateBet(bet.id, { league: e.target.value })}
                      >
                        <option value="">Sem Campeonato</option>
                        {availableLeagues.map(l => (
                          <option key={l} value={l} className="bg-slate-900 text-white">{l}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2.5">
                      <select 
                        className="bg-slate-800/50 text-xs text-yellow-400 font-black uppercase outline-none border border-slate-700/50 px-3 py-1 rounded-lg cursor-pointer hover:border-yellow-400/50 transition-all appearance-none self-start"
                        value={bet.methodology || ''}
                        onChange={(e) => onUpdateBet(bet.id, { methodology: e.target.value })}
                      >
                        <option value="">Sem Método</option>
                        {availableMethodologies.map(m => (
                          <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                        ))}
                      </select>
                      
                      <div className="relative">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(bet.tags || []).map(tag => (
                            <span key={tag} className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center gap-1.5 font-black">
                              #{tag}
                              <button onClick={() => handleToggleTag(bet, tag)} className="hover:text-red-400 transition-colors"><i className="fas fa-times"></i></button>
                            </span>
                          ))}
                          <button 
                            onClick={() => setOpenTagMenuId(openTagMenuId === bet.id ? null : bet.id)}
                            className="text-[11px] bg-slate-800 text-slate-500 hover:text-white border border-slate-700 px-2 py-1 rounded-lg transition-all font-black"
                          >
                            <i className="fas fa-plus mr-1"></i> Tag
                          </button>
                        </div>

                        {openTagMenuId === bet.id && (
                          <div className="absolute z-20 left-0 mt-3 w-56 bg-slate-900 border border-slate-700 rounded-[1.5rem] shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="text-[11px] font-black text-slate-500 uppercase px-3 mb-3 tracking-widest">Selecionar Tags</div>
                            <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                              {availableTags.map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleToggleTag(bet, tag)}
                                  className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all flex items-center justify-between font-bold ${bet.tags?.includes(tag) ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                  #{tag}
                                  {bet.tags?.includes(tag) && <i className="fas fa-check"></i>}
                                </button>
                              ))}
                              {availableTags.length === 0 && <div className="text-xs text-slate-600 px-3 italic">Crie tags primeiro.</div>}
                            </div>
                            <button onClick={() => setOpenTagMenuId(null)} className="w-full mt-3 pt-3 border-t border-slate-800 text-xs font-black text-slate-500 hover:text-white text-center transition-colors">Fechar</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-lg block mb-2 uppercase tracking-widest ${bet.type === BetType.BACK ? 'bg-blue-400/10 text-blue-400' : 'bg-pink-400/10 text-pink-400'}`}>{bet.type}</span>
                    <span className="font-mono text-lg text-slate-300 font-bold">{(monthlyStake > 0 ? monthlyStake : bet.stake).toFixed(2)}{currency}</span>
                  </td>
                  <td className={`px-8 py-6 text-right font-black font-mono ${bet.profit > 0 ? 'text-emerald-400' : bet.profit < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    <div className="text-xl">{bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}{currency}</div>
                    <div className="text-xs opacity-70 mt-1">{bet.profitPercentage.toFixed(1)}% Yield</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => onDelete(bet.id)} className="text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 p-3 text-lg"><i className="fas fa-trash-alt"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {openTagMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenTagMenuId(null)}></div>
      )}
    </div>
  );
};

export default BetList;
