import React, { useState, useEffect, useMemo } from 'react';
import { Bet, BetStatus, Stats, Project } from './types';
import Dashboard from './components/Dashboard';
import AnnualView from './components/AnnualView';
import BetForm from './components/BetForm';
import BetList from './components/BetList';
import MarketsView from './components/MarketsView';
import MethodologiesView from './components/MethodologiesView';
import TagsView from './components/TagsView';
import LeaguesView from './components/LeaguesView';
import TeamsView from './components/TeamsView';
import ProjectsView from './components/ProjectsView';
import CSVImporter from './components/CSVImporter';
import Login, { User } from './components/Login';
import DatabaseManager from './components/DatabaseManager';
import Logo from './components/Logo';
import ProfileSettings from './components/ProfileSettings';

// Inner component to handle data logic when user is authenticated
const BetProfitApp: React.FC<{ user: User; onLogout: () => void; onUpdateUser: (u: User) => void }> = ({ user, onLogout, onUpdateUser }) => {
  // --- HELPER FOR USER-SCOPED STORAGE KEYS ---
  // If user ID is 'default' (legacy migration), use root keys to preserve data.
  // Otherwise, suffix keys with user ID.
  const getKey = (base: string) => user.id === 'default' ? base : `${base}_${user.id}`;

  const loadState = <T,>(baseKey: string, fallback: T): T => {
    try {
      const key = getKey(baseKey);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Erro ao carregar ${baseKey}`, e);
      return fallback;
    }
  };

  const [bets, setBets] = useState<Bet[]>(() => loadState('betprofit_bets', []));
  const [projects, setProjects] = useState<Project[]>(() => loadState('betprofit_projects', []));
  
  // Settings agrupados
  const [settings, setSettings] = useState(() => loadState('betprofit_settings', {
    currency: '€',
    methodologies: ['Lay the Draw', 'Back Favorito', 'Over 2.5', 'Match Odds'],
    tags: ['Live', 'Pré-Live', 'Premier League', 'Champions League'],
    leagues: ['Premier League', 'La Liga', 'Liga Portugal', 'Champions League'],
    monthlyStakes: {} as Record<string, number>,
    monthlyBankrolls: {} as Record<string, number>
  }));

  // Desestruturação
  const currency = settings.currency;
  const methodologiesList = settings.methodologies;
  const tagsList = settings.tags;
  const leaguesList = settings.leagues;
  const monthlyStakes = settings.monthlyStakes;
  const monthlyBankrolls = settings.monthlyBankrolls;

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem(getKey('betprofit_bets'), JSON.stringify(bets)); }, [bets, user.id]);
  useEffect(() => { localStorage.setItem(getKey('betprofit_projects'), JSON.stringify(projects)); }, [projects, user.id]);
  useEffect(() => { localStorage.setItem(getKey('betprofit_settings'), JSON.stringify(settings)); }, [settings, user.id]);

  // --- UI STATE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = Math.max(2025, currentYear);
    return { month: now.getMonth(), year: startYear };
  });
  const [view, setView] = useState<'dashboard' | 'annual' | 'bets' | 'add' | 'markets' | 'methodologies' | 'tags' | 'leagues' | 'teams' | 'projects' | 'data'>('dashboard');
  const [showCSVModal, setShowCSVModal] = useState(false);

  // --- HELPER FUNCTIONS ---

  const updateSettings = (updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateList = (listName: 'methodologies' | 'tags' | 'leagues', newList: string[]) => {
      updateSettings({ [listName]: newList });
  };

  const updateMonthlyBankroll = (val: string) => {
    const num = parseFloat(val) || 0;
    const newMap = { ...monthlyBankrolls, [`${selectedDate.year}-${selectedDate.month}`]: num };
    updateSettings({ monthlyBankrolls: newMap });
  };

  const updateMonthlyStake = (val: string) => {
    const num = parseFloat(val) || 0;
    const newMap = { ...monthlyStakes, [`${selectedDate.year}-${selectedDate.month}`]: num };
    updateSettings({ monthlyStakes: newMap });
  };

  const handleCurrencyChange = (val: string) => {
      updateSettings({ currency: val });
  };

  // --- DATA LOGIC ---

  const getProjectIdFromTags = (tags: string[] = []) => {
     const matchedProject = projects.find(p => 
        p.status === 'ACTIVE' && p.tag && tags.some(t => t.toLowerCase() === p.tag!.toLowerCase())
     );
     return matchedProject?.id;
  };

  const addBet = async (bet: Bet) => {
    const betToSave = { ...bet };
    
    // Auto-associação a projeto
    if (!betToSave.projectId && betToSave.tags) {
      betToSave.projectId = getProjectIdFromTags(betToSave.tags);
    }
    // Auto-associação de dezena se for projeto Baliza Zero
    if (betToSave.projectId) {
        const project = projects.find(p => p.id === betToSave.projectId);
        if (project && project.projectType === 'BALIZA_ZERO') {
            betToSave.dezenaIndex = project.activeDezenaIndex ?? 0;
        }
    }

    setBets(prev => [betToSave, ...prev]);
    setView('bets');
  };

  const updateBet = async (id: string, updates: Partial<Bet>) => {
    setBets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBet = async (id: string) => {
    setBets(prev => prev.filter(b => b.id !== id));
  };

  const createProject = async (project: Project) => {
    if (project.projectType === 'BALIZA_ZERO') {
        project.activeDezenaIndex = 0;
    }
    setProjects(prev => [...prev, project]);
  };

  const deleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const advanceProjectDezena = (projectId: string) => {
    updateProject(projectId, { 
        activeDezenaIndex: (projects.find(p => p.id === projectId)?.activeDezenaIndex ?? 0) + 1 
    });
  };

  const assignBetsToProject = (projectId: string, projectTag: string) => {
    if (!projectTag) return;
    setBets(prev => prev.map(b => {
      if (b.tags?.some(t => t.toLowerCase() === projectTag.toLowerCase())) {
         return { ...b, projectId, dezenaIndex: 0 };
      }
      return b;
    }));
  };

  const handleDataImport = (data: any) => {
      if (data.bets) setBets(data.bets);
      if (data.projects) setProjects(data.projects);
      if (data.methodologies || data.tags || data.leagues || data.monthlyStakes || data.monthlyBankrolls || data.currency) {
          setSettings(prev => ({
              ...prev,
              currency: data.currency || prev.currency,
              methodologies: data.methodologies || prev.methodologies,
              tags: data.tags || prev.tags,
              leagues: data.leagues || prev.leagues,
              monthlyStakes: data.monthlyStakes || prev.monthlyStakes,
              monthlyBankrolls: data.monthlyBankrolls || prev.monthlyBankrolls
          }));
      }
      setView('dashboard');
  };

  // --- FILTERS & MEMOS ---

  const monthKey = `${selectedDate.year}-${selectedDate.month}`;
  const currentMonthlyStake = monthlyStakes[monthKey] || 0;
  const currentMonthlyBankroll = monthlyBankrolls[monthKey] || 0;

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const d = new Date(bet.date);
      return d.getMonth() === selectedDate.month && d.getFullYear() === selectedDate.year;
    });
  }, [bets, selectedDate]);

  const annualBets = useMemo(() => {
    return bets.filter(bet => {
      const d = new Date(bet.date);
      return d.getFullYear() === selectedDate.year;
    });
  }, [bets, selectedDate.year]);

  const teamsList = useMemo(() => {
    const teams = new Set<string>();
    bets.forEach(bet => {
      const parts = bet.event.split(/\s+(?:vs|v|@|-|(?<!\d)\/(?!\d))\s+/i);
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) {
          teams.add(trimmed);
        }
      });
      if (bet.team) teams.add(bet.team);
    });
    return Array.from(teams).sort();
  }, [bets]);

  const stats: Stats = useMemo(() => {
    const total = filteredBets.length;
    if (total === 0) return { 
      totalBets: 0, winRate: 0, totalProfit: 0, roi: 0, yield: 0, 
      monthlyStake: currentMonthlyStake, monthlyBankroll: currentMonthlyBankroll, 
      uniqueMarketsCount: 0, profitInStakes: 0
    };

    const settledBets = filteredBets.filter(b => b.status !== BetStatus.PENDING);
    const wonBets = settledBets.filter(b => b.status === BetStatus.WON).length;
    const totalProfit = settledBets.reduce((acc, b) => acc + b.profit, 0);
    const totalInvested = settledBets.reduce((acc, b) => acc + b.stake, 0);
    
    const profitInStakes = currentMonthlyStake > 0 ? totalProfit / currentMonthlyStake : 0;

    return {
      totalBets: total,
      winRate: settledBets.length > 0 ? (wonBets / settledBets.length) * 100 : 0,
      totalProfit,
      roi: currentMonthlyBankroll > 0 ? (totalProfit / currentMonthlyBankroll) * 100 : 0,
      yield: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0,
      monthlyStake: currentMonthlyStake,
      monthlyBankroll: currentMonthlyBankroll,
      uniqueMarketsCount: total,
      profitInStakes
    };
  }, [filteredBets, currentMonthlyStake, currentMonthlyBankroll]);

  const handleViewChange = (newView: typeof view) => {
    setView(newView);
    setIsMobileMenuOpen(false);
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 hover:text-white p-2"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>

      {/* Mobile/Tablet Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-4 
        transform transition-transform duration-300 ease-in-out shadow-2xl
        lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <Logo size="sm" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">
          <button onClick={() => handleViewChange('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'dashboard' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-chart-pie w-6"></i> Dashboard
          </button>
          <button onClick={() => handleViewChange('annual')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'annual' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-calendar w-6"></i> Anual
          </button>
          <button onClick={() => handleViewChange('bets')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'bets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-list w-6"></i> Histórico
          </button>
          <button onClick={() => handleViewChange('projects')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'projects' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-folder-open w-6"></i> Projetos
          </button>
          <button onClick={() => handleViewChange('markets')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'markets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-bullseye w-6"></i> Mercados
          </button>
          <button onClick={() => handleViewChange('leagues')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'leagues' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-trophy w-6"></i> Campeonatos
          </button>
          <button onClick={() => handleViewChange('teams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'teams' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-users w-6"></i> Equipas
          </button>
          <button onClick={() => handleViewChange('methodologies')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'methodologies' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-flask w-6"></i> Métodos
          </button>
          <button onClick={() => handleViewChange('tags')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'tags' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-tags w-6"></i> Tags
          </button>
          <button onClick={() => handleViewChange('data')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'data' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-database w-6"></i> Dados
          </button>
          <button onClick={() => handleViewChange('add')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'add' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-plus-circle w-6"></i> Registar
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <div 
            className="flex items-center gap-3 px-2 mb-4 cursor-pointer hover:bg-slate-800/50 p-2 rounded-xl transition-all group"
            onClick={() => setShowProfileSettings(true)}
            title="Editar Perfil"
           >
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-yellow-400 font-bold border-2 border-slate-700 group-hover:border-yellow-400 transition-colors overflow-hidden">
               {user.avatar ? (
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 (user.name || '?').charAt(0).toUpperCase()
               )}
             </div>
             <div className="overflow-hidden flex-1">
               <p className="text-sm font-bold text-white truncate group-hover:text-yellow-400 transition-colors">{user.name || 'Utilizador'}</p>
               <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
             </div>
             <i className="fas fa-cog text-slate-600 group-hover:text-white transition-colors"></i>
           </div>
           <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-lg font-medium">
             <i className="fas fa-sign-out-alt w-6"></i> Sair
           </button>
        </div>
      </nav>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto w-full">
        <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white capitalize">
              {view === 'dashboard' ? 'Visão Geral' : view === 'annual' ? 'Visão Anual' : view === 'bets' ? 'Histórico' : view === 'markets' ? 'Análise de Mercados' : view === 'methodologies' ? 'Gestão de Métodos' : view === 'tags' ? 'Análise por Tags' : view === 'leagues' ? 'Campeonatos' : view === 'teams' ? 'Equipas' : view === 'projects' ? 'Gestão de Projetos' : view === 'data' ? 'Base de Dados' : 'Nova Entrada'}
            </h2>
            <p className="text-slate-400 text-lg mt-1">{view === 'annual' ? `Ano de ${selectedDate.year}` : `${months[selectedDate.month]} ${selectedDate.year}`}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
              <label className="text-xs uppercase font-black text-slate-500 tracking-widest mr-1">Moeda:</label>
              <select 
                className="bg-transparent border-none text-yellow-400 font-bold text-lg focus:ring-0 cursor-pointer outline-none" 
                value={currency} 
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="€" className="bg-slate-900">€ (EUR)</option>
                <option value="R$" className="bg-slate-900">R$ (BRL)</option>
                <option value="$" className="bg-slate-900">$ (USD)</option>
                <option value="£" className="bg-slate-900">£ (GBP)</option>
              </select>
            </div>

            {view !== 'annual' && view !== 'projects' && (
              <>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Banca:</label>
                   <input type="number" className="bg-transparent border-none text-emerald-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyBankroll || ''} onChange={(e) => updateMonthlyBankroll(e.target.value)} />
                   <span className="text-slate-500 text-lg">{currency}</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Stake:</label>
                   <input type="number" className="bg-transparent border-none text-yellow-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyStake || ''} onChange={(e) => updateMonthlyStake(e.target.value)} />
                   <span className="text-slate-500 text-lg">{currency}</span>
                </div>
              </>
            )}
            
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
              <i className="fas fa-calendar-alt text-yellow-400 text-sm mr-1"></i>
              {view !== 'annual' && (
                <>
                  <select className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 cursor-pointer" value={selectedDate.month} onChange={(e) => setSelectedDate(prev => ({ ...prev, month: parseInt(e.target.value) }))}>
                    {months.map((m, i) => (<option key={i} value={i} className="bg-slate-900">{m}</option>))}
                  </select>
                  <div className="w-px h-5 bg-slate-800 mx-2"></div>
                </>
              )}
              <select className="bg-transparent border-none text-white font-bold text-sm focus:ring-0 cursor-pointer" value={selectedDate.year} onChange={(e) => setSelectedDate(prev => ({ ...prev, year: parseInt(e.target.value) }))}>
                {years.map(y => (<option key={y} value={y} className="bg-slate-900">{y}</option>))}
              </select>
            </div>

            <button onClick={() => setShowCSVModal(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-2xl font-bold border border-slate-700 text-sm transition-all">
                <i className="fas fa-file-csv mr-2"></i> Importar CSV
            </button>
          </div>
        </header>

        {view === 'dashboard' && <Dashboard stats={stats} bets={filteredBets} allBets={bets} selectedYear={selectedDate.year} currency={currency} />}
        {view === 'annual' && <AnnualView bets={annualBets} selectedYear={selectedDate.year} monthlyBankrolls={monthlyBankrolls} monthlyStakes={monthlyStakes} currency={currency} />}
        {view === 'bets' && <BetList bets={filteredBets} onDelete={deleteBet} onUpdateBet={updateBet} monthlyStake={currentMonthlyStake} availableMethodologies={methodologiesList} availableTags={tagsList} availableLeagues={leaguesList} availableTeams={teamsList} currency={currency} />}
        {view === 'markets' && <MarketsView bets={filteredBets} currency={currency} />}
        {view === 'leagues' && <LeaguesView bets={filteredBets} available={leaguesList} onCreate={(l) => handleUpdateList('leagues', [...leaguesList, l])} onDelete={(l) => handleUpdateList('leagues', leaguesList.filter(x => x !== l))} currency={currency} />}
        {view === 'teams' && <TeamsView bets={filteredBets} availableTeams={teamsList} currency={currency} />}
        {view === 'methodologies' && <MethodologiesView bets={filteredBets} available={methodologiesList} onCreate={(m) => handleUpdateList('methodologies', [...methodologiesList, m])} onDelete={(m) => handleUpdateList('methodologies', methodologiesList.filter(x => x !== m))} currency={currency} />}
        {view === 'tags' && <TagsView bets={filteredBets} available={tagsList} onCreate={(t) => handleUpdateList('tags', [...tagsList, t])} onDelete={(t) => handleUpdateList('tags', tagsList.filter(x => x !== t))} />}
        {view === 'projects' && <ProjectsView projects={projects} bets={bets} onCreate={createProject} onDelete={deleteProject} onUpdate={updateProject} onAssignBets={assignBetsToProject} onAdvanceProjectDezena={advanceProjectDezena} currency={currency} availableTags={tagsList} />}
        {view === 'data' && <DatabaseManager currentData={{ bets, monthlyStakes, monthlyBankrolls, methodologies: methodologiesList, tags: tagsList, leagues: leaguesList, teams: teamsList, projects, currency }} onDataImport={handleDataImport} />}
        {view === 'add' && <BetForm onAdd={addBet} onCancel={() => setView('dashboard')} monthlyStake={currentMonthlyStake} methodologies={methodologiesList} tags={tagsList} leagues={leaguesList} teams={teamsList} projects={projects} currency={currency} />}

        {showCSVModal && <CSVImporter onImport={async (newBets) => { 
            const betsWithProjects = newBets.map(b => {
                let pid = b.projectId;
                if (!pid && b.tags) pid = getProjectIdFromTags(b.tags);
                let dezIndex = 0;
                if(pid) {
                   const p = projects.find(pr => pr.id === pid);
                   if(p && p.projectType === 'BALIZA_ZERO') dezIndex = p.activeDezenaIndex ?? 0;
                }
                return { ...b, projectId: pid, dezenaIndex: dezIndex };
            });
            
            // Local update only
            setBets(prev => [...betsWithProjects, ...prev]); 
            setShowCSVModal(false); 
            setView('bets'); 
        }} onClose={() => setShowCSVModal(false)} monthlyStake={currentMonthlyStake} currency={currency} />}

        {showProfileSettings && (
          <ProfileSettings 
            user={user} 
            onUpdate={onUpdateUser} 
            onClose={() => setShowProfileSettings(false)} 
          />
        )}
      </main>
    </div>
  );
};

// Main App Container to handle Auth state
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
     // Persist to local storage
     const storedUsers = localStorage.getItem('betprofit_users');
     if (storedUsers) {
        try {
           const users = JSON.parse(storedUsers) as User[];
           const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
           localStorage.setItem('betprofit_users', JSON.stringify(newUsers));
        } catch(e) {
           console.error("Failed to update user in storage", e);
        }
     }
     setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Use key to force remount when user changes ID, ensuring hooks re-run with new storage keys
  // Also pass handleUpdateUser
  return (
    <BetProfitApp 
      key={currentUser.id} 
      user={currentUser} 
      onLogout={handleLogout} 
      onUpdateUser={handleUpdateUser}
    />
  );
};

export default App;