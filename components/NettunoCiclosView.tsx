import React, { useMemo, useState, useEffect } from 'react';
import { Project, Bet, BetStatus } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface NettunoCiclosViewProps {
  project: Project;
  bets: Bet[];
  onBack: () => void;
  currency: string;
  onAdvanceCycle?: (projectId: string) => void;
}

const CYCLE_BANKS = [100, 100, 150, 250, 465]; // Base targets based on typical Nettuno progression

const NettunoCiclosView: React.FC<NettunoCiclosViewProps> = ({ project, bets, onBack, currency, onAdvanceCycle }) => {
  const activeCycle = project.activeCycleIndex ?? 0;
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(activeCycle);

  useEffect(() => {
    setSelectedCycleIndex(project.activeCycleIndex ?? 0);
  }, [project.activeCycleIndex]);

  // Ordenar apostas
  const sortedBets = useMemo(() => {
    return [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bets]);

  // Simulação Dinâmica dos Ciclos
  const { cycleData, currentActiveCycle } = useMemo(() => {
     const profitRatio = 1.3107; // 131.07% de lucro esperado no ciclo
     const ratio = project.startBankroll / 100;

     // Inicializar os 5 ciclos
     const cycles = [0, 1, 2, 3, 4].map(idx => {
         const startBank = CYCLE_BANKS[idx] * ratio;
         return {
             idx,
             startBank,
             targetProfit: startBank * profitRatio,
             targetBank: startBank + (startBank * profitRatio),
             currentProfit: 0,
             currentBank: startBank,
             isCompleted: false,
             bets: [] as Bet[]
         };
     });

     let active = 0;

     sortedBets.forEach(bet => {
         if (active < 5) {
             const cycle = cycles[active];
             cycle.bets.push(bet);
             cycle.currentProfit += bet.profit;
             cycle.currentBank = cycle.startBank + cycle.currentProfit;
             
             if (cycle.currentBank >= cycle.targetBank && active < 4) {
                 cycle.isCompleted = true;
                 active++;
             }
         } else {
             // Todas as apostas adicionais vão para o último ciclo
             const cycle = cycles[4];
             cycle.bets.push(bet);
             cycle.currentProfit += bet.profit;
             cycle.currentBank = cycle.startBank + cycle.currentProfit;
             if (cycle.currentBank >= cycle.targetBank) cycle.isCompleted = true;
         }
     });

     const finalCycles = cycles.map((c, idx) => ({
         ...c,
         isActive: idx === active,
         isFuture: idx > active
     }));

     return { cycleData: finalCycles, currentActiveCycle: active };
  }, [project.startBankroll, project.nettunoInitialPercentage, sortedBets]);

  useEffect(() => {
    setSelectedCycleIndex(currentActiveCycle);
  }, [currentActiveCycle]);

  const selectedCycle = cycleData[selectedCycleIndex] || cycleData[0];

  // Gráfico da evolução do ciclo
  const chartData = useMemo(() => {
    if (!selectedCycle || selectedCycle.bets.length === 0) return [];
    
    let runningBank = selectedCycle.startBank;
    const data = [{ name: 'Início', balance: runningBank }];
    
    selectedCycle.bets.forEach((b, i) => {
        runningBank += b.profit;
        data.push({ name: `Aposta ${i+1}`, balance: runningBank });
    });
    
    return data;
  }, [selectedCycle]);

  const handleAdvanceCycle = () => {
      if (onAdvanceCycle) {
          onAdvanceCycle(project.id);
      }
  };

  return (
    <div className="bg-black min-h-screen p-4 md:p-8 font-sans text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-slate-800 pb-6">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 relative group">
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                 <defs>
                    <linearGradient id="mintGreen" x1="0" y1="0" x2="1" y2="1">
                       <stop offset="0%" stopColor="#6ee7b7" />
                       <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="slateWhite" x1="0" y1="0" x2="1" y2="1">
                       <stop offset="0%" stopColor="#e2e8f0" />
                       <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                       <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                       <feOffset dx="1" dy="1" result="offsetblur"/>
                       <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                       <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                 </defs>
                 
                 <g transform="translate(50, 50)">
                    {/* Arcs */}
                    <path d="M -15 -35 A 38 38 0 0 1 15 -35" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 35 -15 A 38 38 0 0 1 35 15" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 15 35 A 38 38 0 0 1 -15 35" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                    <path d="M -35 15 A 38 38 0 0 1 -35 -15" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />

                    {/* Center Square */}
                    <rect x="-20" y="-20" width="40" height="40" fill="none" stroke="#1e3a8a" strokeWidth="4" rx="4" />
                    
                    {/* Green N */}
                    <path d="M -9 12 V -12 L 9 12 V -12" fill="none" stroke="url(#mintGreen)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Arrows at 45 degrees */}
                    {/* NW */}
                    <path d="M -15 -28 L -45 -45 L -28 -15 Z" fill="url(#slateWhite)" filter="url(#dropShadow)" />
                    {/* SW */}
                    <path d="M -15 28 L -45 45 L -28 15 Z" fill="url(#slateWhite)" filter="url(#dropShadow)" />
                    {/* SE */}
                    <path d="M 15 28 L 45 45 L 28 15 Z" fill="url(#slateWhite)" filter="url(#dropShadow)" />
                    
                    {/* NE (Green) */}
                    <path d="M 15 -28 L 45 -45 L 28 -15 Z" fill="url(#mintGreen)" filter="url(#dropShadow)" />
                 </g>
             </svg>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-200 tracking-tighter uppercase leading-none">
              Método <br/>
              <span className="text-indigo-400">Ciclos</span>
              <span className="text-xl md:text-2xl text-emerald-400 ml-2 font-bold italic normal-case tracking-normal">By Nettuno</span>
            </h1>
            <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400">{project.name}</span>
                {project.tag && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                       #{project.tag}
                    </span>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0">
          <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold border border-slate-600 transition-all">
            <i className="fas fa-arrow-left mr-2"></i> Voltar
          </button>
          
          {selectedCycleIndex === activeCycle && activeCycle < 4 && (
             <button
                 onClick={handleAdvanceCycle}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold border border-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2"
             >
                Avançar para Ciclo {activeCycle + 2} <i className="fas fa-arrow-right ml-2"></i>
             </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 md:p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Progresso Geral */}
        <div className="grid grid-cols-5 gap-2 lg:gap-4 mb-8">
            {cycleData.map(c => (
                <div 
                   key={c.idx}
                   onClick={() => !c.isFuture && setSelectedCycleIndex(c.idx)}
                   className={`
                      relative p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all cursor-pointer
                      ${c.isFuture ? 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed' : ''}
                      ${c.isActive ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : ''}
                      ${c.isCompleted && !c.isActive ? 'border-emerald-500/50 bg-emerald-500/10' : ''}
                      ${selectedCycleIndex === c.idx && !c.isActive && !c.isFuture ? 'border-slate-500 bg-slate-800' : ''}
                      ${!c.isFuture && selectedCycleIndex !== c.idx && !c.isActive ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : ''}
                   `}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${c.isActive ? 'text-indigo-400' : c.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                            Ciclo {c.idx + 1}
                        </span>
                        {c.isCompleted && <i className="fas fa-check-circle text-emerald-500"></i>}
                    </div>
                    <div className="text-xs lg:text-sm font-bold text-white mb-1">
                        Meta: {c.targetBank.toFixed(2)}{currency}
                    </div>
                    {!c.isFuture && (
                        <div className="text-[10px] lg:text-xs text-slate-400">
                            Atual: {c.currentBank.toFixed(2)}{currency}
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Detalhes do Ciclo Selecionado */}
        {selectedCycle && !selectedCycle.isFuture && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                   <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Estatísticas do Ciclo {selectedCycle.idx + 1}</h4>
                       <div className="space-y-4">
                           <div>
                               <div className="text-sm text-slate-400 mb-1">Banca Inicial</div>
                               <div className="text-xl font-bold text-white">{selectedCycle.startBank.toFixed(2)}{currency}</div>
                           </div>
                           <div>
                               <div className="text-sm text-slate-400 mb-1">Meta de Lucro (130%)</div>
                               <div className="text-xl font-bold text-indigo-400">+{selectedCycle.targetProfit.toFixed(2)}{currency}</div>
                           </div>
                           <div className="pt-4 border-t border-slate-700">
                               <div className="text-sm text-slate-400 mb-1">Banca Atual</div>
                               <div className={`text-2xl font-bold ${selectedCycle.currentBank >= selectedCycle.targetBank ? 'text-emerald-400' : 'text-white'}`}>
                                   {selectedCycle.currentBank.toFixed(2)}{currency}
                               </div>
                           </div>
                           <div>
                               <div className="text-sm text-slate-400 mb-1">Progresso do Ciclo</div>
                               <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-700">
                                  <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, ((selectedCycle.currentBank - selectedCycle.startBank) / selectedCycle.targetProfit) * 100)}%` }}></div>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>

                <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Curva do Ciclo</h4>
                    <div className="flex-1 w-full h-[200px]">
                        {chartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorCycleBank" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 10', 'auto']} width={40} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCycleBank)" />
                             </AreaChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                               Sem apostas registadas neste ciclo.
                           </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Entradas do Ciclo */}
        {selectedCycle && !selectedCycle.isFuture && selectedCycle.bets.length > 0 && (
            <div className="mt-8 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse font-mono">
                        <thead>
                            <tr className="bg-indigo-900/40 border-b border-indigo-500/30">
                                <th colSpan={7} className="p-4 text-center text-indigo-400 font-bold uppercase tracking-widest">
                                    <div className="flex items-center justify-center gap-2">
                                        <i className="fas fa-list-ul"></i>
                                        Entradas do Ciclo {selectedCycle.idx + 1}
                                    </div>
                                </th>
                            </tr>
                            <tr className="bg-indigo-950/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                                <th className="p-4 border-r border-slate-800">Data</th>
                                <th className="p-4 border-r border-slate-800">Evento</th>
                                <th className="p-4 border-r border-slate-800">Mercado</th>
                                <th className="p-4 border-r border-slate-800 text-right">Stake</th>
                                <th className="p-4 border-r border-slate-800 text-right">Lucro/Prej.</th>
                                <th className="p-4 border-r border-slate-800 text-right">% Stake</th>
                                <th className="p-4 text-right">Banca Acum.</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {(() => {
                                let accumBank = selectedCycle.startBank;
                                return selectedCycle.bets.map((bet, i) => {
                                    accumBank += bet.profit;
                                    const percentage = bet.stake > 0 ? (bet.profit / bet.stake) * 100 : 0;
                                    return (
                                        <tr key={bet.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 border-r border-slate-800/50 whitespace-nowrap">{new Date(bet.date).toLocaleDateString()}</td>
                                            <td className="p-3 border-r border-slate-800/50 truncate max-w-[150px] font-sans font-medium">{bet.event}</td>
                                            <td className="p-3 border-r border-slate-800/50 truncate max-w-[120px] font-sans">{bet.market}</td>
                                            <td className="p-3 border-r border-slate-800/50 text-right font-medium">{bet.stake.toFixed(2)}{currency}</td>
                                            <td className={`p-3 border-r border-slate-800/50 text-right font-bold ${bet.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {bet.profit >= 0 ? '+' : ''}{bet.profit.toFixed(2)}{currency}
                                            </td>
                                            <td className={`p-3 border-r border-slate-800/50 text-right font-bold ${percentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                                            </td>
                                            <td className="p-3 text-right text-indigo-400 font-bold">{accumBank.toFixed(2)}{currency}</td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default NettunoCiclosView;
