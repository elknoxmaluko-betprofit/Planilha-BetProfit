import React, { useState, useMemo } from 'react';
import { Project, Bet, BetStatus } from '../types';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import BalizaZeroView from './BalizaZeroView';
import NettunoCiclosView from './NettunoCiclosView';

interface ProjectsViewProps {
  projects: Project[];
  bets: Bet[];
  onCreate: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onAssignBets: (projectId: string, tag: string) => void;
  onAdvanceProjectDezena?: (projectId: string) => void;
  onAdvanceProjectCycle?: (projectId: string) => void;
  currency: string;
  availableTags: string[];
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, bets, onCreate, onDelete, onUpdate, onAssignBets, onAdvanceProjectDezena, onAdvanceProjectCycle, currency, availableTags }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    startBankroll: 100,
    goal: 1000, 
    stakeGoal: 100,
    balizaZeroTargetMultiplier: 2.5,
    bankrollDivision: 10,
    nettunoInitialPercentage: 5,
    nettunoCyclesCount: 5 as 5 | 10,
    startDate: new Date().toISOString().split('T')[0],
    description: '',
    projectType: 'STANDARD',
    tag: ''
  });

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [projects, selectedProjectId]);

  const projectStats = useMemo(() => {
    return projects.map(proj => {
      // Filtra apostas que têm o projectId explícito OU que contêm a Tag do projeto
      const projectBets = bets.filter(b => {
         const hasExplicitId = b.projectId === proj.id;
         const hasMatchingTag = proj.tag && b.tags && b.tags.some(t => t.toLowerCase() === proj.tag!.toLowerCase());
         return hasExplicitId || hasMatchingTag;
      });

      const settledBets = projectBets.filter(b => b.status !== BetStatus.PENDING);
      
      let totalProfit = 0;
      let currentBankroll = 0;
      let progress = 0;
      let currentDezenaStake = 0;

      // Lógica específica para Baliza Zero (Cálculo Proporcional à Stake do Projeto)
      if (proj.projectType === 'BALIZA_ZERO' && proj.bankrollDivision) {
          // 1. Cálculo da Stake Teórica para a Dezena Ativa (Plano Perfeito)
          // Garante que a stake exibida corresponde exatamente à etapa em vigor
          let theoBank = proj.startBankroll;
          const activeIdx = proj.activeDezenaIndex || 0;
          
          for (let i = 0; i <= activeIdx; i++) {
              let s = theoBank / proj.bankrollDivision;
              if (proj.stakeGoal && s > proj.stakeGoal) s = proj.stakeGoal;
              
              if (i === activeIdx) {
                  currentDezenaStake = s;
              }
              // Crescimento teórico (Meta de 2.5x a stake)
              theoBank += (s * (proj.balizaZeroTargetMultiplier || 2.5));
          }

          // 2. Cálculo dos Resultados Reais (Lucro e Banca Atual)
          let tempTotalProfit = 0;
          
          // Agrupar apostas por dezena
          const betsByDezena: Record<number, Bet[]> = {};
          projectBets.forEach(b => {
              const d = b.dezenaIndex || 0;
              if (!betsByDezena[d]) betsByDezena[d] = [];
              betsByDezena[d].push(b);
          });

          // Encontrar a última dezena com apostas
          const maxDezena = Math.max(activeIdx, ...Object.keys(betsByDezena).map(Number));

          for (let i = 0; i <= maxDezena; i++) {
              const dbets = betsByDezena[i] || [];
              let dezenaProfit = 0;

              // Calcular lucro desta dezena (Valor Real)
              dbets.forEach(b => {
                  dezenaProfit += b.profit;
              });

              tempTotalProfit += dezenaProfit;
          }

          totalProfit = tempTotalProfit;
          currentBankroll = proj.startBankroll + totalProfit;

          // Progresso visual Baliza Zero (Baseado na Stake Teórica)
          const startStake = proj.startBankroll / proj.bankrollDivision;
          if (proj.stakeGoal && proj.stakeGoal > startStake) {
               progress = ((currentDezenaStake - startStake) / (proj.stakeGoal - startStake)) * 100;
          }

      } else if (proj.projectType === 'NETTUNO_CICLOS') {
          totalProfit = settledBets.reduce((acc, b) => acc + b.profit, 0);
          currentBankroll = proj.startBankroll + totalProfit;
          
          const profitRatio = 1.3107;
          const maxCycleMultiplier = proj.nettunoCyclesCount === 10 ? 8.65 : 4.65;
          const maxCycleGoal = (proj.startBankroll * maxCycleMultiplier) * (1 + profitRatio);

          progress = Math.min(100, Math.max(0, (currentBankroll / maxCycleGoal) * 100));
          // Armazenar meta calculada para exibir no painel
          (proj as any)._calculatedNettunoGoal = maxCycleGoal;
      } else {
          // Lógica Standard (Soma direta)
          totalProfit = settledBets.reduce((acc, b) => acc + b.profit, 0);
          currentBankroll = proj.startBankroll + totalProfit;
          
          if (proj.goal) {
            progress = ((currentBankroll - proj.startBankroll) / (proj.goal - proj.startBankroll)) * 100;
          }
      }

      const roi = proj.startBankroll > 0 ? (totalProfit / proj.startBankroll) * 100 : 0;
      
      // Gerar dados do gráfico
      let runningBank = proj.startBankroll;
      const chartData = [
        { name: 'Start', value: proj.startBankroll },
        ...projectBets
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((b, i) => {
             runningBank += b.profit;
             return { name: i, value: runningBank };
          })
      ];

      return {
        ...proj,
        projectBets, 
        totalProfit,
        currentBankroll,
        betCount: projectBets.length,
        winRate: settledBets.length > 0 ? (settledBets.filter(b => b.status === BetStatus.WON).length / settledBets.length) * 100 : 0,
        progress: Math.max(0, Math.min(100, progress)),
        chartData,
        roi,
        currentDezenaStake
      };
    });
  }, [projects, bets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.startBankroll && newProject.tag) {
      const project: Project = {
        id: crypto.randomUUID(),
        name: newProject.name,
        startBankroll: Number(newProject.startBankroll),
        startDate: newProject.startDate || new Date().toISOString(),
        status: 'ACTIVE',
        description: newProject.description,
        projectType: newProject.projectType || 'STANDARD',
        goal: newProject.projectType === 'STANDARD' && newProject.goal ? Number(newProject.goal) : undefined,
        stakeGoal: newProject.projectType === 'BALIZA_ZERO' && newProject.stakeGoal ? Number(newProject.stakeGoal) : undefined,
        balizaZeroTargetMultiplier: newProject.projectType === 'BALIZA_ZERO' && newProject.balizaZeroTargetMultiplier ? Number(newProject.balizaZeroTargetMultiplier) : undefined,
        bankrollDivision: newProject.projectType === 'BALIZA_ZERO' && newProject.bankrollDivision ? Number(newProject.bankrollDivision) : undefined,
        nettunoInitialPercentage: newProject.projectType === 'NETTUNO_CICLOS' && newProject.nettunoInitialPercentage ? Number(newProject.nettunoInitialPercentage) : undefined,
        nettunoCyclesCount: newProject.projectType === 'NETTUNO_CICLOS' && newProject.nettunoCyclesCount ? newProject.nettunoCyclesCount : undefined,
        tag: newProject.tag ? newProject.tag.trim().toLowerCase() : undefined
      };
      
      onCreate(project);
      
      // Associa apostas existentes que já tenham esta tag
      if (project.tag) {
        onAssignBets(project.id, project.tag);
      }

      setShowForm(false);
      setNewProject({ 
        name: '', 
        startBankroll: 100, 
        goal: 1000, 
        stakeGoal: 100,
    balizaZeroTargetMultiplier: 2.5,
        bankrollDivision: 10,
        nettunoInitialPercentage: 5,
        nettunoCyclesCount: 5 as 5 | 10,
        startDate: new Date().toISOString().split('T')[0], 
        description: '', 
        projectType: 'STANDARD',
        tag: ''
      });
    }
  };

  const filteredTags = useMemo(() => {
    if (!newProject.tag) return availableTags;
    return availableTags.filter(t => t.toLowerCase().includes(newProject.tag!.toLowerCase()));
  }, [availableTags, newProject.tag]);

  if (selectedProject) {
    const activeStats = projectStats.find(p => p.id === selectedProject.id);
    const betsForView = activeStats ? activeStats.projectBets : [];

    if (selectedProject.projectType === 'BALIZA_ZERO') {
      return (
        <BalizaZeroView 
          project={selectedProject} 
          bets={betsForView} 
          onBack={() => setSelectedProjectId(null)} 
          currency={currency}
          onAdvanceDezena={onAdvanceProjectDezena}
        />
      );
    }
    if (selectedProject.projectType === 'NETTUNO_CICLOS') {
      return (
        <NettunoCiclosView 
          project={selectedProject} 
          bets={betsForView} 
          onBack={() => setSelectedProjectId(null)} 
          currency={currency}
          onAdvanceCycle={onAdvanceProjectCycle}
        />
      );
    }
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedProject.name}</h2>
                {selectedProject.tag && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                    #{selectedProject.tag}
                  </span>
                )}
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                 <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Banca Inicial</p>
                 <p className="text-xl font-bold text-white">{selectedProject.startBankroll.toFixed(2)}{currency}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                 <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Banca Atual</p>
                 <p className={`text-xl font-bold ${activeStats && activeStats.currentBankroll >= selectedProject.startBankroll ? 'text-emerald-400' : 'text-red-400'}`}>
                    {activeStats ? activeStats.currentBankroll.toFixed(2) : selectedProject.startBankroll.toFixed(2)}{currency}
                 </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                 <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Entradas</p>
                 <p className="text-xl font-bold text-white">{betsForView.length}</p>
              </div>
           </div>

           {betsForView.length > 0 ? (
               <div className="border border-slate-700 rounded-lg overflow-hidden mt-8">
                   <div className="overflow-x-auto">
                       <table className="w-full text-xs text-left border-collapse font-mono">
                           <thead>
                               <tr className="bg-slate-800 text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                                   <th className="p-3 border-r border-slate-700">Data</th>
                                   <th className="p-3 border-r border-slate-700">Evento</th>
                                   <th className="p-3 border-r border-slate-700">Mercado</th>
                                   <th className="p-3 border-r border-slate-700 text-right">Stake</th>
                                   <th className="p-3 border-r border-slate-700 text-right">Lucro/Prejuízo</th>
                               </tr>
                           </thead>
                           <tbody className="bg-slate-900 text-slate-300">
                               {betsForView.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(bet => (
                                   <tr key={bet.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                       <td className="p-2 border-r border-slate-800">{new Date(bet.date).toLocaleDateString()}</td>
                                       <td className="p-2 border-r border-slate-800 truncate max-w-[150px]">{bet.event}</td>
                                       <td className="p-2 border-r border-slate-800 truncate max-w-[120px]">{bet.market}</td>
                                       <td className="p-2 border-r border-slate-800 text-right">{bet.stake.toFixed(2)}{currency}</td>
                                       <td className={`p-2 border-r border-slate-800 text-right font-bold ${bet.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                           {bet.profit >= 0 ? '+' : ''}{bet.profit.toFixed(2)}{currency}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           ) : (
               <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700 mt-8">
                   <i className="fas fa-list-ul text-4xl text-slate-600 mb-4"></i>
                   <p className="text-slate-400">Nenhuma aposta associada a este projeto ainda.</p>
               </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-slate-400">Gerencie desafios específicos. Use <b>Tags</b> para associar as suas entradas automaticamente.</p>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-yellow-400/20 transition-all flex items-center gap-2"
        >
          <i className={`fas ${showForm ? 'fa-minus' : 'fa-plus'}`}></i> Novo Projeto
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-rocket text-yellow-400"></i> Configurar Novo Projeto
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Tipo de Projeto</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  type="button" 
                  onClick={() => setNewProject({ ...newProject, projectType: 'STANDARD' })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newProject.projectType === 'STANDARD' ? 'border-yellow-400 bg-yellow-400/10 text-white' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-500'}`}
                >
                  <i className="fas fa-chart-line text-2xl"></i>
                  <span className="font-bold">Padrão</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewProject({ ...newProject, projectType: 'BALIZA_ZERO' })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newProject.projectType === 'BALIZA_ZERO' ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-500'}`}
                >
                  <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-2xl">
                    <defs>
                      <linearGradient id="premiumGold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient id="darkMetal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <pattern id="hexNet" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M5 0 L10 2.5 L10 7.5 L5 10 L0 7.5 L0 2.5 Z" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.4"/>
                      </pattern>
                      <filter id="dropShadowBZ" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                        <feOffset dx="2" dy="2" result="offsetblur"/>
                        <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <rect x="10" y="27.5" width="80" height="45" fill="url(#hexNet)" />
                    <path d="M5 77.5 V22.5 H95 V77.5" stroke="url(#darkMetal)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#dropShadowBZ)"/>
                    <path d="M20 27.5 H40 L48 34 V44 L42 50 L48 56 V66 L40 72.5 H20 V27.5 Z M28 35.5 V43.5 H37 L40 41 V38 L37 35.5 H28 Z M28 56.5 V64.5 H37 L40 62 V59 L37 56.5 H28 Z" fill="url(#darkMetal)" stroke="#1e293b" strokeWidth="0.5" fillRule="evenodd" filter="url(#dropShadowBZ)"/>
                    <path d="M55 27.5 H85 L85 35.5 L65 64.5 H85 V72.5 H50 V64.5 L70 35.5 H55 V27.5 Z" fill="url(#premiumGold)" stroke="#fff" strokeWidth="0.5" filter="url(#dropShadowBZ)"/>
                  </svg>
                  <span className="font-bold">Baliza Zero</span>
                  <span className="text-[10px] uppercase bg-amber-500 text-black px-2 rounded font-black">Template</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewProject({ ...newProject, projectType: 'NETTUNO_CICLOS' })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newProject.projectType === 'NETTUNO_CICLOS' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-slate-500'}`}
                >
                  <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-2xl">
                     <defs>
                        <linearGradient id="mintGreen" x1="0" y1="0" x2="1" y2="1">
                           <stop offset="0%" stopColor="#6ee7b7" />
                           <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <linearGradient id="slateWhite" x1="0" y1="0" x2="1" y2="1">
                           <stop offset="0%" stopColor="#e2e8f0" />
                           <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                        <filter id="dropShadowNC" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                           <feOffset dx="1" dy="1" result="offsetblur"/>
                           <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                           <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                     </defs>
                     <g transform="translate(50, 50)">
                        <path d="M -15 -35 A 38 38 0 0 1 15 -35" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 35 -15 A 38 38 0 0 1 35 15" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 15 35 A 38 38 0 0 1 -15 35" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                        <path d="M -35 15 A 38 38 0 0 1 -35 -15" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                        <rect x="-20" y="-20" width="40" height="40" fill="none" stroke="#1e3a8a" strokeWidth="4" rx="4" />
                        <path d="M -9 12 V -12 L 9 12 V -12" fill="none" stroke="url(#mintGreen)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M -15 -28 L -45 -45 L -28 -15 Z" fill="url(#slateWhite)" filter="url(#dropShadowNC)" />
                        <path d="M -15 28 L -45 45 L -28 15 Z" fill="url(#slateWhite)" filter="url(#dropShadowNC)" />
                        <path d="M 15 28 L 45 45 L 28 15 Z" fill="url(#slateWhite)" filter="url(#dropShadowNC)" />
                        <path d="M 15 -28 L 45 -45 L 28 -15 Z" fill="url(#mintGreen)" filter="url(#dropShadowNC)" />
                     </g>
                  </svg>
                  <span className="font-bold text-center">Método Ciclos</span>
                  <span className="text-[10px] uppercase bg-indigo-500 text-white px-2 rounded font-black">Template</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Nome do Projeto</label>
              <input type="text" required placeholder="Ex: Alavancagem Baliza Zero" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Tag de Associação</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">#</span>
                <input 
                  type="text" 
                  required
                  placeholder="ex: baliza01" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-yellow-400" 
                  value={newProject.tag} 
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onChange={e => setNewProject({...newProject, tag: e.target.value})} 
                />
              </div>
              
              {/* Dropdown de Sugestões de Tags */}
              {showTagSuggestions && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-b border-slate-800 last:border-0 flex justify-between items-center"
                        onClick={() => setNewProject({ ...newProject, tag: tag })}
                      >
                        <span className="font-bold">#{tag}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-500 text-sm italic">Nenhuma tag encontrada. Digite para criar nova.</div>
                  )}
                </div>
              )}
              
              <p className="text-[10px] text-slate-500 mt-1">Apostas com esta tag serão adicionadas automaticamente.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Banca Inicial ({currency})</label>
              <input type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400" value={newProject.startBankroll} onChange={e => setNewProject({...newProject, startBankroll: Number(e.target.value)})} />
            </div>

            {newProject.projectType === 'STANDARD' ? (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Objetivo Banca ({currency})</label>
                <input type="number" placeholder="Opcional" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400" value={newProject.goal} onChange={e => setNewProject({...newProject, goal: Number(e.target.value)})} />
              </div>
            ) : newProject.projectType === 'BALIZA_ZERO' ? (
              <>
                 <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Divisão de Banca (unidades)</label>
                  <input type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" value={newProject.bankrollDivision} onChange={e => setNewProject({...newProject, bankrollDivision: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-amber-500 tracking-widest">Objetivo Stake ({currency})</label>
                  <input type="number" placeholder="Ex: Chegar a stake de 100€" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" value={newProject.stakeGoal || ''} onChange={e => setNewProject({...newProject, stakeGoal: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-amber-500 tracking-widest">Multiplicador da Dezena (ex: 2.5)</label>
                  <input type="number" step="0.1" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" value={newProject.balizaZeroTargetMultiplier} onChange={e => setNewProject({...newProject, balizaZeroTargetMultiplier: Number(e.target.value)})} />
                </div>
              </>
            ) : (
              <div className="md:col-span-1 space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs uppercase font-bold text-indigo-400 tracking-widest">% Alvo por Entrada (Inicial)</label>
                   <input type="number" step="0.1" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" value={newProject.nettunoInitialPercentage} onChange={e => setNewProject({...newProject, nettunoInitialPercentage: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs uppercase font-bold text-indigo-400 tracking-widest">Número de Ciclos</label>
                   <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" value={newProject.nettunoCyclesCount} onChange={e => setNewProject({...newProject, nettunoCyclesCount: Number(e.target.value) as 5 | 10})}>
                       <option value={5}>5 Ciclos</option>
                       <option value={10}>10 Ciclos</option>
                   </select>
                 </div>
                 <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex flex-col justify-center">
                    <h4 className="text-indigo-400 font-bold text-sm mb-1"><i className="fas fa-info-circle mr-2"></i>Método Ciclos</h4>
                    <p className="text-slate-400 text-xs">As metas dos {newProject.nettunoCyclesCount || 5} ciclos serão calculadas automaticamente com base na banca de {newProject.startBankroll || 0}{currency} e alvo de {newProject.nettunoInitialPercentage || 5}%. As metas decrescem a cada aposta.</p>
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Data Início</label>
              <input type="date" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Descrição</label>
              <textarea placeholder="Regras do desafio, estratégias, etc..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400 min-h-[80px]" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-white">Cancelar</button>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20">Criar Projeto</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projectStats.map((proj) => (
          <div 
            key={proj.id} 
            className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 lg:p-8 hover:border-slate-700 transition-all group relative overflow-hidden shadow-lg flex flex-col cursor-pointer"
            onClick={() => setSelectedProjectId(proj.id)}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${proj.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  <h3 className="text-xl font-bold text-white">{proj.name}</h3>
                  {proj.projectType === 'BALIZA_ZERO' && (
                    <span className="bg-amber-500/20 text-amber-500 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-amber-500/30">Baliza Zero</span>
                  )}
                  {proj.projectType === 'NETTUNO_CICLOS' && (
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-indigo-500/30">Método Ciclos</span>
                  )}
                </div>
                {proj.tag && (
                  <div className="mb-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md font-mono border border-slate-700">#{proj.tag}</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 line-clamp-1">{proj.description || "Sem descrição"}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(proj.id); }} 
                className="text-slate-700 hover:text-red-500 transition-colors p-2 z-10"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Banca Atual (Proj.)</p>
                <p className={`text-2xl font-mono font-black ${proj.currentBankroll >= proj.startBankroll ? 'text-emerald-400' : 'text-red-400'}`}>
                  {proj.currentBankroll.toFixed(2)}{currency}
                </p>
                <p className="text-xs text-slate-500 mt-1">Início: {proj.startBankroll}{currency}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">ROI / Entradas</p>
                <p className={`text-xl font-mono font-bold ${proj.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {proj.roi > 0 ? '+' : ''}{proj.roi.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">{proj.betCount} Apostas</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase">
                <span>Progresso</span>
                {proj.projectType === 'BALIZA_ZERO' && proj.stakeGoal ? (
                   <span>Meta Stake: {proj.stakeGoal}{currency}</span>
                ) : proj.projectType === 'NETTUNO_CICLOS' ? (
                   <span>Meta (Ciclo {proj.nettunoCyclesCount || 5}): {((proj as any)._calculatedNettunoGoal || 1075).toFixed(2)}{currency}</span>
                ) : proj.goal ? (
                   <span>Meta: {proj.goal}{currency}</span>
                ) : (
                   <span>Sem Meta</span>
                )}
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000" 
                  style={{ width: `${proj.progress}%` }}
                ></div>
              </div>
              {proj.projectType === 'BALIZA_ZERO' && (
                <div className="text-right mt-1">
                   <p className="text-[10px] text-amber-500 font-bold border border-amber-500/20 bg-amber-500/10 px-2 py-1 inline-block rounded">
                      Stake Atual: {proj.currentDezenaStake ? proj.currentDezenaStake.toFixed(2) : '0.00'}{currency}
                   </p>
                </div>
              )}
            </div>

            <div className="h-24 mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={proj.chartData}>
                   <defs>
                     <linearGradient id={`grad${proj.id}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} fill={`url(#grad${proj.id})`} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0 backdrop-blur-[2px]">
               <div className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                 <i className="fas fa-eye"></i> Abrir Projeto
               </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          </div>
        ))}

        {projects.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
            <i className="fas fa-folder-open text-6xl text-slate-700 mb-4"></i>
            <p className="text-xl font-bold text-slate-500">Nenhum projeto ativo</p>
            <p className="text-sm text-slate-600">Crie o seu primeiro desafio clicando no botão acima.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;