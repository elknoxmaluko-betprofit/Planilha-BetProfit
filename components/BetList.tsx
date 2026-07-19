import React, { useState } from 'react';
import { Bet, BetStatus, BetType } from '../types';
import ConfirmModal from './ConfirmModal';
import { TeamBadge } from './TeamsView';

interface BetListProps {
  bets: Bet[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
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
  onEdit,
  onUpdateBet, 
  monthlyStake, 
  availableMethodologies, 
  availableTags,
  availableLeagues = [],
  availableTeams = [] ,
  currency
}) => {
type MenuType = 'league' | 'methodology' | 'tags';
  const [openMenu, setOpenMenu] = useState<{ id: string, type: MenuType } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleTag = (bet: Bet, tag: string) => {
    const currentTags = bet.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onUpdateBet(bet.id, { tags: newTags });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] shadow-2xl relative">
      <div className={`rounded-[2.5rem] transition-all duration-300 ${openMenu ? 'overflow-visible pb-64 md:pb-0' : 'overflow-x-auto'} md:overflow-visible`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800">
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em] rounded-tl-[2.5rem]">Operação</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Mercado / Camp.</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Método / Tags</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-center tracking-[0.2em]">Stake</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-right tracking-[0.2em]">P/L</th>
              <th className="px-8 py-6 text-slate-500 font-black text-xs uppercase text-right tracking-[0.2em] rounded-tr-[2.5rem]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {bets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-28 text-center text-slate-500 italic text-lg rounded-b-[2.5rem]">Sem registos para mostrar neste período.</td>
              </tr>
            ) : (
              bets.map((bet, index) => (
                <tr key={bet.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className={`px-8 py-6 ${index === bets.length - 1 ? 'rounded-bl-[2.5rem]' : ''}`}>
                    <div className="text-xs text-slate-500 font-black mb-2">{new Date(bet.date).toLocaleDateString('pt-PT')}</div>
                    {(() => {
                      const match = bet.event.match(/^(.*?)\s+(?:v|vs\.?|x|-)\s+(.*?)$/i);
                      if (match) {
                        const home = match[1].trim();
                        const away = match[2].trim();
                        return (
                          <div className="flex items-center justify-start gap-3 py-1 min-w-[220px]">
                            <div className="flex-shrink-0">
                              <TeamBadge teamName={home} size="sm" editable={false} />
                            </div>
                            <div className="font-black text-white text-base md:text-lg text-center px-2 leading-snug break-words">
                              <span>{home}</span>
                              <span className="text-slate-500 font-bold mx-2">v</span>
                              <span>{away}</span>
                            </div>
                            <div className="flex-shrink-0">
                              <TeamBadge teamName={away} size="sm" editable={false} />
                            </div>
                          </div>
                        );
                      }
                      return <div className="font-black text-white text-base">{bet.event}</div>;
                    })()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-400 bg-slate-800 self-start px-3 py-1 rounded-lg border border-slate-700 font-bold">{bet.market}</span>
                      
                      <div className="relative">
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setOpenMenu(openMenu?.id === bet.id && openMenu.type === 'league' ? null : { id: bet.id, type: 'league' });
                          }}
                          className="bg-slate-800/50 text-xs text-blue-400 font-black uppercase outline-none border border-slate-700/50 px-3 py-1.5 rounded-lg cursor-pointer hover:border-blue-400/50 transition-all flex items-center gap-2 max-w-[200px]"
                        >
                          <span className="truncate">{bet.league || 'Sem Campeonato'}</span>
                          <i className={`fas fa-chevron-down text-[10px] opacity-50 transition-transform ${openMenu?.id === bet.id && openMenu.type === 'league' ? 'rotate-180' : ''}`}></i>
                        </button>
                        {openMenu?.id === bet.id && openMenu.type === 'league' && (
                          <div className="absolute z-50 left-0 mt-2 min-w-[280px] w-max max-w-[350px] md:max-w-[450px] bg-slate-900 border border-slate-700 rounded-[1.5rem] shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="text-[11px] font-black text-slate-500 uppercase px-1 mb-2 tracking-widest pt-1 flex justify-between items-center">
                              Selecionar Campeonato
                            </div>
                            <div className="px-1 mb-3">
                              <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                <input
                                  type="text"
                                  placeholder="Pesquisar..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto flex flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                              {availableLeagues.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).map(l => (
                                <button
                                  key={l}
                                  onClick={() => { onUpdateBet(bet.id, { league: l }); setOpenMenu(null); }}
                                  className={`text-[10px] px-3 py-1.5 rounded-full transition-all font-bold whitespace-nowrap flex items-center gap-1 ${bet.league === l ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'}`}
                                >
                                  {l}
                                  {bet.league === l && <i className="fas fa-check ml-1 text-[9px]"></i>}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => setOpenMenu(null)} className="w-full mt-3 pt-2 border-t border-slate-800/50 text-xs font-black text-slate-500 hover:text-white text-center transition-colors pb-1">Fechar</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2.5">
                      <div className="relative">
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setOpenMenu(openMenu?.id === bet.id && openMenu.type === 'methodology' ? null : { id: bet.id, type: 'methodology' });
                          }}
                          className="bg-slate-800/50 text-xs text-yellow-400 font-black uppercase outline-none border border-slate-700/50 px-3 py-1.5 rounded-lg cursor-pointer hover:border-yellow-400/50 transition-all flex items-center gap-2 max-w-[200px]"
                        >
                          <span className="truncate">{bet.methodology || 'Sem Método'}</span>
                          <i className={`fas fa-chevron-down text-[10px] opacity-50 transition-transform ${openMenu?.id === bet.id && openMenu.type === 'methodology' ? 'rotate-180' : ''}`}></i>
                        </button>
                        {openMenu?.id === bet.id && openMenu.type === 'methodology' && (
                          <div className="absolute z-50 left-0 mt-2 min-w-[280px] w-max max-w-[350px] md:max-w-[450px] bg-slate-900 border border-slate-700 rounded-[1.5rem] shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="text-[11px] font-black text-slate-500 uppercase px-1 mb-2 tracking-widest pt-1 flex justify-between items-center">
                              Selecionar Método
                            </div>
                            <div className="px-1 mb-3">
                              <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                <input
                                  type="text"
                                  placeholder="Pesquisar..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-yellow-500 transition-colors"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto flex flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                              {availableMethodologies.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                                <button
                                  key={m}
                                  onClick={() => { onUpdateBet(bet.id, { methodology: m }); setOpenMenu(null); }}
                                  className={`text-[10px] px-3 py-1.5 rounded-full transition-all font-bold whitespace-nowrap flex items-center gap-1 ${bet.methodology === m ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'}`}
                                >
                                  {m}
                                  {bet.methodology === m && <i className="fas fa-check ml-1 text-[9px]"></i>}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => setOpenMenu(null)} className="w-full mt-3 pt-2 border-t border-slate-800/50 text-xs font-black text-slate-500 hover:text-white text-center transition-colors pb-1">Fechar</button>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(bet.tags || []).map(tag => (
                            <span key={tag} className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center gap-1.5 font-black">
                              #{tag}
                              <button onClick={() => handleToggleTag(bet, tag)} className="hover:text-red-400 transition-colors"><i className="fas fa-times"></i></button>
                            </span>
                          ))}
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setOpenMenu(openMenu?.id === bet.id && openMenu.type === 'tags' ? null : { id: bet.id, type: 'tags' });
                            }}
                            className="text-[11px] bg-slate-800 text-slate-500 hover:text-white border border-slate-700 px-2 py-1 rounded-lg transition-all font-black flex items-center gap-1"
                          >
                            <i className="fas fa-plus"></i> Tag
                          </button>
                        </div>

                        {openMenu?.id === bet.id && openMenu.type === 'tags' && (
                          <div className="absolute z-50 left-0 mt-2 min-w-[280px] w-max max-w-[350px] md:max-w-[450px] bg-slate-900 border border-slate-700 rounded-[1.5rem] shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="text-[11px] font-black text-slate-500 uppercase px-1 mb-2 tracking-widest pt-1 flex justify-between items-center">
                              Selecionar Tags
                            </div>
                            <div className="px-1 mb-3">
                              <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                <input
                                  type="text"
                                  placeholder="Pesquisar..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto flex flex-wrap gap-1.5 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                              {availableTags.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleToggleTag(bet, tag)}
                                  className={`text-[10px] px-3 py-1.5 rounded-full transition-all font-bold whitespace-nowrap flex items-center gap-1 ${bet.tags?.includes(tag) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'}`}
                                >
                                  #{tag}
                                  {bet.tags?.includes(tag) && <i className="fas fa-check ml-1 text-[9px]"></i>}
                                </button>
                              ))}
                              {availableTags.length === 0 && <div className="text-xs text-slate-600 px-1 py-1 italic">Crie tags primeiro.</div>}
                            </div>
                            <button onClick={() => setOpenMenu(null)} className="w-full mt-3 pt-2 border-t border-slate-800/50 text-xs font-black text-slate-500 hover:text-white text-center transition-colors pb-1">Fechar</button>
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
                  <td className={`px-8 py-6 text-right ${index === bets.length - 1 ? 'rounded-br-[2.5rem]' : ''}`}>
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => onEdit(bet.id)} className="text-slate-700 hover:text-yellow-400 transition-all opacity-0 group-hover:opacity-100 p-3 text-lg"><i className="fas fa-pen"></i></button>
                      <button onClick={() => setDeletingId(bet.id)} className="text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 p-3 text-lg"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)}></div>
      )}
      
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Confirmar Eliminação"
        message="Tem a certeza que pretende eliminar esta entrada? Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (deletingId) onDelete(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default BetList;
