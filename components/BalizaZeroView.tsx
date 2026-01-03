
import React, { useMemo, useState, useEffect } from 'react';
import { Project, Bet, BetStatus } from '../types';

interface BalizaZeroViewProps {
  project: Project;
  bets: Bet[];
  onBack: () => void;
  currency: string;
  onAdvanceDezena?: (projectId: string) => void;
}

const BalizaZeroView: React.FC<BalizaZeroViewProps> = ({ project, bets, onBack, currency, onAdvanceDezena }) => {
  const [activeTab, setActiveTab] = useState<'PAINEL' | 'DETALHADO' | 'MERCADOS'>('PAINEL');
  
  // Sincroniza a dezena selecionada com a dezena ativa do projeto ao abrir ou mudar de etapa
  const [selectedDezenaIndex, setSelectedDezenaIndex] = useState(project.activeDezenaIndex ?? 0);
  
  useEffect(() => {
    setSelectedDezenaIndex(project.activeDezenaIndex ?? 0);
  }, [project.activeDezenaIndex]);

  // Utiliza a divisão definida no projeto, ou 10 como fallback
  const bankDivision = project.bankrollDivision || 10;
  
  // Índice da dezena ativa no projeto
  const activeProjectDezena = project.activeDezenaIndex ?? 0;

  // Ordenar apostas por data
  const sortedBets = useMemo(() => {
    return [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bets]);

  // Agrupar em Dezenas MANUAIS baseadas no dezenaIndex
  const dezenas = useMemo(() => {
    const map: Record<number, Bet[]> = {};
    
    // Inicializa até à dezena ativa atual para garantir que existem
    for (let i = 0; i <= activeProjectDezena; i++) {
        map[i] = [];
    }

    sortedBets.forEach(bet => {
        const idx = bet.dezenaIndex ?? 0;
        if (!map[idx]) map[idx] = [];
        map[idx].push(bet);
    });

    return Object.values(map);
  }, [sortedBets, activeProjectDezena]);

  // Projeção Visual (Tabela) - Escada de Lucro Teórica (Plano de Metas)
  const projectionData = useMemo(() => {
    const rows = [];
    let runningBank = project.startBankroll;
    const stakeGoal = project.stakeGoal || 0;
    const maxSafetyRows = 100;

    for (let i = 0; i < maxSafetyRows; i++) {
        const stake = runningBank / bankDivision;
        const goal = stake * 2.5;

        rows.push({
            id: i + 1,
            bank: runningBank,
            stake: stake,
            goal: goal
        });

        // Condição de paragem baseada na stake alvo
        if (stakeGoal > 0 && stake >= stakeGoal && i >= activeProjectDezena) {
            break;
        }

        // Fallback se não houver objetivo
        if (!stakeGoal && i >= Math.max(19, activeProjectDezena + 5)) {
            break;
        }

        runningBank += goal;
    }
    return rows;
  }, [project.startBankroll, bankDivision, activeProjectDezena, project.stakeGoal]);

  const totalProfit = sortedBets.reduce((acc, b) => acc + b.profit, 0);
  
  // A stake recomendada agora segue estritamente a programação teórica para a dezena ativa
  const recommendedStake = useMemo(() => {
    const currentStep = projectionData[activeProjectDezena];
    return currentStep ? currentStep.stake : (project.startBankroll / bankDivision);
  }, [projectionData, activeProjectDezena, project.startBankroll, bankDivision]);

  const marketMatrix = useMemo(() => {
    const markets = [
      'UNDER 0.5', 'UNDER 1.5', 'UNDER 2.5', 'UNDER 3.5', 'UNDER 4.5', 
      'UNDER 5.5', 'UNDER 6.5', 'UNDER 7.5', 'UNDER 8.5'
    ];
    
    return markets.map(m => {
      const htBets = sortedBets.filter(b => b.market.toUpperCase().includes(`${m} HT`) || (b.market.toUpperCase().includes(m) && b.market.toUpperCase().includes('FIRST HALF')));
      const ftBets = sortedBets.filter(b => b.market.toUpperCase().includes(`${m} FT`) || (b.market.toUpperCase().includes(m) && !b.market.toUpperCase().includes('FIRST HALF')));

      const calculateStats = (group: Bet[]) => {
        const count = group.length;
        const profit = group.reduce((acc, b) => acc + b.profit, 0);
        const goalsConceded = group.filter(b => b.status === BetStatus.LOST).length;
        return { count, profit, goalsConceded };
      };

      return {
        market: m,
        ht: calculateStats(htBets),
        ft: calculateStats(ftBets)
      };
    });
  }, [sortedBets]);

  const handleValidateDezena = () => {
    if (onAdvanceDezena) {
      onAdvanceDezena(project.id);
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
                  {/* Gradiente Dourado Premium para o Z */}
                  <linearGradient id="premiumGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" /> {/* Amber 500 */}
                    <stop offset="50%" stopColor="#d97706" /> {/* Amber 600 */}
                    <stop offset="100%" stopColor="#b45309" /> {/* Amber 700 */}
                  </linearGradient>
                  
                  {/* Gradiente Metal Escuro para o B e Frame */}
                  <linearGradient id="darkMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" /> {/* Slate 700 */}
                    <stop offset="100%" stopColor="#0f172a" /> {/* Slate 900 */}
                  </linearGradient>

                   {/* Padrão de Rede Hexagonal */}
                  <pattern id="hexNet" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.4"/>
                  </pattern>

                  {/* Sombra 3D */}
                  <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="2" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge> 
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Background da Rede (Dentro da Baliza) */}
                <rect x="10" y="27.5" width="80" height="45" fill="url(#hexNet)" />

                {/* Estrutura da Baliza (Frame) - Retangular */}
                <path 
                  d="M5 77.5 V22.5 H95 V77.5" 
                  stroke="url(#darkMetal)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  fill="none" 
                  filter="url(#dropShadow)"
                />
                
                {/* Letra B - Geometria Angular e Moderna */}
                <path 
                  d="M20 27.5 H40 L48 34 V44 L42 50 L48 56 V66 L40 72.5 H20 V27.5 Z M28 35.5 V43.5 H37 L40 41 V38 L37 35.5 H28 Z M28 56.5 V64.5 H37 L40 62 V59 L37 56.5 H28 Z" 
                  fill="url(#darkMetal)" 
                  stroke="#1e293b"
                  strokeWidth="0.5"
                  fillRule="evenodd"
                  filter="url(#dropShadow)"
                />

                {/* Letra Z - Centrada no novo formato */}
                <path 
                  d="M55 27.5 H85 L85 35.5 L65 64.5 H85 V72.5 H50 V64.5 L70 35.5 H55 V27.5 Z" 
                  fill="url(#premiumGold)" 
                  stroke="#fff"
                  strokeWidth="0.5"
                  filter="url(#dropShadow)"
                />

             </svg>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-200 tracking-tighter uppercase leading-none">
              Baliza <br/>
              <span className="text-amber-500">Zero</span>
              <span className="text-xl md:text-2xl text-sky-400 ml-2 font-bold italic normal-case tracking-normal">By Priori</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0">
          <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold border border-slate-600 transition-all">
            <i className="fas fa-arrow-left mr-2"></i> Voltar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => setActiveTab('PAINEL')} className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 ${activeTab === 'PAINEL' ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black border-b-4 border-amber-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>Painel e Resultados</button>
        <button onClick={() => setActiveTab('MERCADOS')} className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 ${activeTab === 'MERCADOS' ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black border-b-4 border-amber-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>Análise por Mercado</button>
        <button onClick={() => setActiveTab('DETALHADO')} className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 ${activeTab === 'DETALHADO' ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-black border-b-4 border-amber-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>Detalhado</button>
      </div>

      {activeTab === 'PAINEL' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-white text-black p-1">
             <div className="bg-slate-300 p-2 font-bold text-center border-b border-black text-amber-700 text-xl uppercase tracking-widest">
               Programação Projeto Baliza Zero
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 bg-black">
                {/* Lado Esquerdo - Tabela Planeamento */}
                <div className="bg-slate-200 p-2">
                   <div className="flex bg-amber-200 p-1 mb-2 border border-amber-400">
                      <div className="flex-1 text-xs font-bold text-amber-800 uppercase text-center">Gestão da sua banca -&gt; Ela será dividida em</div>
                      <div className="w-16 bg-blue-300 text-center font-bold border border-blue-400">{bankDivision}</div>
                      <div className="w-20 text-center font-bold text-amber-800 uppercase">Stakes</div>
                   </div>

                   <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500">
                     <table className="w-full text-xs border-collapse border border-black text-center font-mono relative">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-400 text-black">
                             <th className="border border-black p-1">Dezena</th>
                             <th className="border border-black p-1">Banca</th>
                             <th className="border border-black p-1">Stake</th>
                             <th className="border border-black p-1">Meta Stake</th>
                             <th className="border border-black p-1">Meta Dezena</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectionData.map((row, i) => {
                               const isActive = i === activeProjectDezena;
                               return (
                                 <tr key={i} className={`${isActive ? 'bg-yellow-100 text-black font-bold ring-2 ring-inset ring-amber-500' : i % 2 === 0 ? 'bg-black text-white' : 'bg-slate-300 text-black'}`}>
                                   <td className="border border-slate-600 p-1">{row.id}ª</td>
                                   <td className="border border-slate-600 p-1 text-right px-2">{currency} {row.bank.toFixed(2)}</td>
                                   <td className="border border-slate-600 p-1 text-right px-2">{currency} {row.stake.toFixed(2)}</td>
                                   <td className="border border-slate-600 p-1 bg-blue-400 text-black font-bold">2.5</td>
                                   <td className="border border-slate-600 p-1 text-right px-2">{currency} {row.goal.toFixed(2)}</td>
                                 </tr>
                               );
                          })}
                        </tbody>
                     </table>
                   </div>
                   
                   <div className="mt-2 bg-amber-100 border border-amber-400 p-2 flex justify-between items-center">
                      <span className="font-bold text-amber-800 uppercase text-sm">STAKE DE TRABALHO ATUAL:</span>
                      <span className="bg-yellow-300 px-4 py-1 text-xl font-black text-black border-2 border-black shadow-sm">
                        {currency} {recommendedStake.toFixed(2)}
                      </span>
                   </div>
                </div>

                <div className="bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                   <h2 className="text-8xl font-black text-slate-200 tracking-tighter relative z-10">BALIZA</h2>
                   <h2 className="text-8xl font-black text-amber-500 tracking-tighter relative z-10">ZERO</h2>
                   <div className="absolute inset-0 bg-amber-600/5 z-0"></div>
                   {project.stakeGoal && (
                     <div className="mt-8 relative z-10 bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Objetivo Stake</p>
                        <p className="text-4xl font-black text-emerald-400">{currency} {project.stakeGoal}</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="mt-8">
             <div className="bg-amber-200 border-t-4 border-amber-500 p-2 text-center">
               <h3 className="text-2xl font-black text-amber-700 uppercase tracking-widest">Resultados</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-xs text-center border-collapse font-mono bg-black text-white">
                 <thead>
                   <tr className="bg-amber-100 text-amber-900 uppercase text-[10px] font-bold">
                     <th className="p-2 border border-slate-500">Etapa</th>
                     <th className="p-2 border border-slate-500">Data Início</th>
                     <th className="p-2 border border-slate-500">Status</th>
                     <th className="p-2 border border-slate-500">Banca Inicial</th>
                     <th className="p-2 border border-slate-500">Stake</th>
                     <th className="p-2 border border-slate-500">P/L Real</th>
                     <th className="p-2 border border-slate-500 bg-amber-200">Meta da Dezena</th>
                     <th className="p-2 border border-slate-500 bg-amber-200">Progresso</th>
                     <th className="p-2 border border-slate-500 bg-amber-300 min-w-[120px]">Meta Atingida?</th>
                     <th className="p-2 border border-slate-500">Saldo Final (Real)</th>
                   </tr>
                 </thead>
                 <tbody>
                   {projectionData.map((plan, i) => {
                     // Lógica para mostrar apenas dezenas que já existem ou a atual
                     if (i > activeProjectDezena) return null;

                     const dezenaBets = dezenas[i] || [];
                     const isCurrent = i === activeProjectDezena;
                     const isPast = i < activeProjectDezena;
                     
                     // Dados Reais da Dezena
                     const actualProfit = dezenaBets.reduce((acc, b) => acc + b.profit, 0);
                     
                     // Banca Inicial e Stake agora seguem a PROGRAMAÇÃO (plan)
                     const realStartBank = plan.bank;
                     const realStake = plan.stake;
                     const targetMeta = plan.goal;
                     
                     // O Saldo Final Real mostra o resultado da banca inicial teórica + lucro real obtido
                     const finalBalanceReal = realStartBank + actualProfit;
                     
                     // Cálculo do progresso
                     const progressPct = targetMeta > 0 ? Math.min(100, Math.max(0, (actualProfit / targetMeta) * 100)) : 0;
                     const isNegative = actualProfit < 0;

                     // Contagem de dias de trabalho únicos
                     const uniqueDays = new Set(dezenaBets.map(b => new Date(b.date).toDateString())).size;
                     const canConclude = uniqueDays >= 10;

                     return (
                       <tr key={i} className={`border-b border-slate-800 transition-colors ${isCurrent ? 'bg-slate-900/80' : ''}`}>
                         <td className="p-3 border-r border-slate-800 bg-slate-900 font-bold">{plan.id}ª Dezena</td>
                         <td className="p-3 border-r border-slate-800 text-slate-400">{dezenaBets.length > 0 ? new Date(dezenaBets[0].date).toLocaleDateString() : '-'}</td>
                         <td className={`p-3 border-r border-slate-800 font-bold ${isCurrent ? 'text-yellow-400' : 'text-emerald-400'}`}>
                           {isCurrent ? 'Em Andamento' : 'Finalizada'}
                         </td>
                         <td className="p-3 border-r border-slate-800 text-slate-400">{currency} {realStartBank.toFixed(2)}</td>
                         <td className="p-3 border-r border-slate-800 font-bold text-white">{currency} {realStake.toFixed(2)}</td>
                         <td className={`p-3 border-r border-slate-800 font-bold ${actualProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                           {actualProfit > 0 ? '+' : ''}{actualProfit.toFixed(2)}
                         </td>
                         <td className="p-3 border-r border-slate-800 bg-slate-900/50 text-amber-200">{currency} {targetMeta.toFixed(2)}</td>
                         <td className="p-3 border-r border-slate-800 bg-slate-900/50 text-amber-200 font-bold relative overflow-hidden">
                           <div className="absolute inset-0 bg-emerald-500/20" style={{ width: `${progressPct}%` }}></div>
                           <span className={`relative z-10 ${isNegative ? 'text-red-400' : progressPct >= 100 ? 'text-emerald-400' : 'text-amber-200'}`}>
                              {isNegative ? '0.0%' : `${progressPct.toFixed(1)}%`}
                           </span>
                         </td>
                         <td className="p-3 border-r border-slate-800">
                           <div className="flex gap-1 justify-center">
                             {isPast ? (
                               <>
                                 <span className="bg-emerald-500 text-black px-3 py-1 rounded font-black uppercase text-[10px] flex-1 flex items-center justify-center">SIM</span>
                                 <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded font-black uppercase text-[10px] flex-1 flex items-center justify-center">NÃO</span>
                               </>
                             ) : isCurrent ? (
                               <>
                                 <button 
                                    onClick={canConclude ? handleValidateDezena : undefined}
                                    disabled={!canConclude}
                                    className={`${
                                        canConclude 
                                        ? 'bg-slate-700 hover:bg-emerald-500 text-white hover:text-black' 
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    } px-3 py-1 rounded transition-all font-black text-[10px] uppercase flex-1 flex flex-col items-center justify-center`}
                                    title={!canConclude ? `Necessários 10 dias de trabalho. Atual: ${uniqueDays}` : 'Concluir Dezena'}
                                    style={{ height: '32px' }}
                                 >
                                   <span>SIM</span>
                                   {!canConclude && <span className="text-[7px] leading-none mt-0.5 text-slate-500">{uniqueDays}/10 Dias</span>}
                                 </button>
                                 <button 
                                    className="bg-red-500 text-white px-3 py-1 rounded font-black text-[10px] uppercase flex-1"
                                    style={{ height: '32px' }}
                                 >
                                   NÃO
                                 </button>
                               </>
                             ) : '-'}
                           </div>
                         </td>
                         <td className="p-3 font-bold text-white">{currency} {finalBalanceReal.toFixed(2)}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'MERCADOS' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-black border border-amber-600/30 p-2">
                 <div className="bg-amber-600/20 text-amber-500 text-center font-bold p-4 mb-6 border-b border-amber-600/30 uppercase tracking-widest text-2xl">
                   Matriz de Mercados (Under)
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="col-span-full mb-8">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-amber-700 text-black uppercase text-xs">
                            <th className="p-3 border border-amber-900">Mercado</th>
                            <th className="p-3 border border-amber-900">Qtd Total</th>
                            <th className="p-3 border border-amber-900">Qtd Gol</th>
                            <th className="p-3 border border-amber-900">% Gols</th>
                            <th className="p-3 border border-amber-900">Profit/Loss</th>
                          </tr>
                        </thead>
                        <tbody className="bg-black text-slate-300 font-mono text-base">
                          {marketMatrix.map((m, i) => {
                            const marketNum = parseFloat(m.market.replace('UNDER ', ''));
                            return (
                            <React.Fragment key={i}>
                              {marketNum <= 2.5 && (
                              <tr className="hover:bg-slate-900">
                                <td className="p-3 border border-slate-800 font-bold text-slate-400">{m.market} HT</td>
                                <td className="p-3 border border-slate-800 text-center text-white">{m.ht.count}</td>
                                <td className="p-3 border border-slate-800 text-center text-red-400">{m.ht.goalsConceded}</td>
                                <td className="p-3 border border-slate-800 text-center text-blue-300">{m.ht.count > 0 ? ((m.ht.goalsConceded / m.ht.count) * 100).toFixed(0) : 0}%</td>
                                <td className={`p-3 border border-slate-800 text-right font-bold ${m.ht.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {currency} {m.ht.profit.toFixed(2)}
                                </td>
                              </tr>
                              )}
                              <tr className="hover:bg-slate-900">
                                <td className="p-3 border border-slate-800 font-bold text-slate-200 border-b-2 border-b-slate-700">{m.market} FT</td>
                                <td className="p-3 border border-slate-800 text-center text-white border-b-2 border-b-slate-700">{m.ft.count}</td>
                                <td className="p-3 border border-slate-800 text-center text-red-400 border-b-2 border-b-slate-700">{m.ft.goalsConceded}</td>
                                <td className="p-3 border border-slate-800 text-center text-blue-300 border-b-2 border-b-slate-700">{m.ft.count > 0 ? ((m.ft.goalsConceded / m.ft.count) * 100).toFixed(0) : 0}%</td>
                                <td className={`p-3 border-border-slate-800 text-right font-bold border-b-2 border-b-slate-700 ${m.ft.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {currency} {m.ft.profit.toFixed(2)}
                                </td>
                              </tr>
                            </React.Fragment>
                          )})}
                        </tbody>
                      </table>
                    </div>
                 </div>
             </div>
        </div>
      )}

      {activeTab === 'DETALHADO' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
             <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs uppercase font-bold">Data Início</p>
                   <p className="text-white font-bold">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-slate-500 text-xs uppercase font-bold">Stake Atual (Prog.)</p>
                   <p className="text-2xl font-black text-amber-500">{currency} {recommendedStake.toFixed(2)}</p>
                </div>
             </div>
             <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs uppercase font-bold">Lucro Total Projeto</p>
                   <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} {currency}
                   </p>
                </div>
                <div className="bg-black px-4 py-2 rounded-lg border border-slate-800">
                   <span className="text-3xl font-black text-white">{sortedBets.length}</span>
                   <span className="text-xs text-slate-500 block uppercase font-bold">Entradas</span>
                </div>
             </div>
          </div>

          <div className="mb-4 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
                {dezenas.map((chunk, index) => {
                    const isActive = selectedDezenaIndex === index;
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDezenaIndex(index)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                                isActive 
                                ? 'bg-amber-500 text-black border-amber-600' 
                                : 'bg-slate-800 text-white border-slate-700 hover:border-amber-500/50'
                            }`}
                        >
                            {index + 1}ª Dezena {index === activeProjectDezena ? '(Atual)' : ''}
                        </button>
                    )
                })}
            </div>
          </div>

          <div className="border border-slate-700 rounded-lg overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-amber-900/40">
                      <th colSpan={8} className="p-2 text-center text-amber-500 font-bold uppercase tracking-widest border-b border-amber-600/30">
                        Detalhes da {selectedDezenaIndex + 1}ª Dezena
                      </th>
                    </tr>
                    <tr className="bg-sky-200 text-black uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-3 border-r border-sky-300">Data</th>
                      <th className="p-3 border-r border-sky-300">Jogo</th>
                      <th className="p-3 border-r border-sky-300">Mercado</th>
                      <th className="p-3 border-r border-sky-300">Stake</th>
                      <th className="p-3 border-r border-sky-300">Levou Gol?</th>
                      <th className="p-3 border-r border-sky-300">P/L</th>
                      <th className="p-3 border-r border-sky-300">% Stake</th>
                      <th className="p-3">Saldo Dezena {currency}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black text-slate-300">
                    {(() => {
                        const currentDezenaBets = dezenas[selectedDezenaIndex] || [];
                        const dezenaBaseline = projectionData[selectedDezenaIndex]?.bank || project.startBankroll;
                        
                        const rows = currentDezenaBets.map((bet, idx) => {
                            const localAccumulated = currentDezenaBets.slice(0, idx + 1).reduce((acc, b) => acc + b.profit, 0);
                            const displayAccumulated = dezenaBaseline + localAccumulated;
                            
                            const isLost = bet.status === BetStatus.LOST;
                            const pctStake = bet.stake > 0 ? (bet.profit / bet.stake) * 100 : 0;

                            return (
                                <tr key={bet.id} className="hover:bg-slate-900 border-b border-slate-900 transition-colors">
                                    <td className="p-3 border-r border-slate-900">{new Date(bet.date).toLocaleDateString()}</td>
                                    <td className="p-3 border-r border-slate-900 text-white font-bold truncate max-w-[150px]">{bet.event}</td>
                                    <td className="p-3 border-r border-slate-900 text-slate-400">{bet.market}</td>
                                    <td className="p-3 border-r border-slate-900">{currency} {bet.stake.toFixed(2)}</td>
                                    <td className="p-3 border-r border-slate-900 text-center">
                                    {isLost ? <span className="text-red-500 font-bold">SIM</span> : <span className="text-slate-600">NÃO</span>}
                                    </td>
                                    <td className={`p-3 border-r border-slate-900 font-bold ${bet.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {bet.profit >= 0 ? '+' : ''}{bet.profit.toFixed(2)}
                                    </td>
                                    <td className={`p-3 border-r border-slate-900 ${pctStake >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {pctStake.toFixed(1)}%
                                    </td>
                                    <td className={`p-3 font-bold ${displayAccumulated >= dezenaBaseline ? 'text-blue-400' : 'text-red-400'}`}>
                                    {currency} {displayAccumulated.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        });
                        return rows;
                    })()}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalizaZeroView;
