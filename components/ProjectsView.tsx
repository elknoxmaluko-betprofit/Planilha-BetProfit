
import React, { useState, useMemo } from 'react';
import { Project, Bet, BetStatus } from '../types';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import BalizaZeroView from './BalizaZeroView';

interface ProjectsViewProps {
  projects: Project[];
  bets: Bet[];
  onCreate: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onAssignBets: (projectId: string, tag: string) => void;
  onAdvanceProjectDezena?: (projectId: string) => void;
  currency: string;
  availableTags: string[];
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, bets, onCreate, onDelete, onUpdate, onAssignBets, onAdvanceProjectDezena, currency, availableTags }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    startBankroll: 100,
    goal: 1000, 
    stakeGoal: 100,
    bankrollDivision: 10,
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
      
      const totalProfit = settledBets.reduce((acc, b) => acc + b.profit, 0);
      const currentBankroll = proj.startBankroll + totalProfit;
      
      let progress = 0;
      let currentDezenaStake = 0; // Nova variável para stake fixa por dezena
      
      if (proj.projectType === 'BALIZA_ZERO' && proj.stakeGoal && proj.bankrollDivision) {
        // Cálculo da Stake Teórica para a Dezena Atual
        let tempBank = proj.startBankroll;
        const div = proj.bankrollDivision;
        const activeIdx = proj.activeDezenaIndex || 0;
        
        for (let i = 0; i <= activeIdx; i++) {
           currentDezenaStake = tempBank / div;
           const goal = currentDezenaStake * 2.5;
           tempBank += goal;
           
           // Limite pela Stake Goal, se definido (igual ao BalizaZeroView)
           if (proj.stakeGoal && currentDezenaStake >= proj.stakeGoal && i < activeIdx) {
              currentDezenaStake = proj.stakeGoal; // Cap stake
              // Recalcula crescimento com stake limitada se necessário, mas simplificando:
              // Se atingiu a meta, mantemos a meta.
           }
        }
        // Se ultrapassar meta, fixa na meta
        if (proj.stakeGoal && currentDezenaStake > proj.stakeGoal) {
            currentDezenaStake = proj.stakeGoal;
        }

        // Progresso visual (baseado em stake atual vs stake goal)
        const startStake = proj.startBankroll / proj.bankrollDivision;
        progress = proj.stakeGoal > startStake 
          ? ((currentDezenaStake - startStake) / (proj.stakeGoal - startStake)) * 100
          : 0;

      } else if (proj.goal) {
        progress = ((currentBankroll - proj.startBankroll) / (proj.goal - proj.startBankroll)) * 100;
      }

      const roi = proj.startBankroll > 0 ? (totalProfit / proj.startBankroll) * 100 : 0;
      
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
        projectBets, // Passa as apostas filtradas para uso posterior (ex: BalizaZeroView)
        totalProfit,
        currentBankroll,
        betCount: projectBets.length,
        winRate: settledBets.length > 0 ? (settledBets.filter(b => b.status === BetStatus.WON).length / settledBets.length) * 100 : 0,
        progress: Math.max(0, Math.min(100, progress)),
        chartData,
        roi,
        currentDezenaStake // Disponibiliza no objeto
      };
    });
  }, [projects, bets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.startBankroll) {
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
        bankrollDivision: newProject.projectType === 'BALIZA_ZERO' && newProject.bankrollDivision ? Number(newProject.bankrollDivision) : undefined,
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
        bankrollDivision: 10,
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
    // Usa as apostas filtradas no projectStats para garantir que a tag foi considerada
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
           <p className="text-slate-400 mt-4">Detalhes do projeto padrão aqui.</p>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <i className="fas fa-futbol text-2xl"></i>
                  <span className="font-bold">Baliza Zero</span>
                  <span className="text-[10px] uppercase bg-amber-500 text-black px-2 rounded font-black">Template</span>
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
            ) : (
              <>
                 <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-widest">Divisão de Banca (unidades)</label>
                  <input type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" value={newProject.bankrollDivision} onChange={e => setNewProject({...newProject, bankrollDivision: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-amber-500 tracking-widest">Objetivo Stake ({currency})</label>
                  <input type="number" placeholder="Ex: Chegar a stake de 100€" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" value={newProject.stakeGoal} onChange={e => setNewProject({...newProject, stakeGoal: Number(e.target.value)})} />
                </div>
              </>
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
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Banca Atual</p>
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
