
import React, { useState, useEffect, useMemo } from 'react';
import { Bet, BetStatus, Stats } from './types';
import Dashboard from './components/Dashboard';
import AnnualView from './components/AnnualView';
import BetForm from './components/BetForm';
import BetList from './components/BetList';
import MarketsView from './components/MarketsView';
import MethodologiesView from './components/MethodologiesView';
import TagsView from './components/TagsView';
import LeaguesView from './components/LeaguesView';
import TeamsView from './components/TeamsView';
import CSVImporter from './components/CSVImporter';
import Login from './components/Login';
import DatabaseManager from './components/DatabaseManager';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('betprofit_auth') === 'true';
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('betfair_bets');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('betprofit_currency') || '€';
  });

  const [monthlyStakes, setMonthlyStakes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('betfair_monthly_stakes');
    return saved ? JSON.parse(saved) : {};
  });

  const [monthlyBankrolls, setMonthlyBankrolls] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('betfair_monthly_bankrolls');
    return saved ? JSON.parse(saved) : {};
  });

  const [methodologiesList, setMethodologiesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('betfair_methodologies');
    return saved ? JSON.parse(saved) : ['Lay the Draw', 'Back Favorito', 'Over 2.5', 'Match Odds'];
  });

  const [tagsList, setTagsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('betfair_tags');
    return saved ? JSON.parse(saved) : ['Live', 'Pré-Live', 'Premier League', 'Champions League'];
  });

  const [leaguesList, setLeaguesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('betfair_leagues');
    return saved ? JSON.parse(saved) : ['Premier League', 'La Liga', 'Liga Portugal', 'Champions League'];
  });
  
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
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = Math.max(2025, currentYear);
    return { month: now.getMonth(), year: startYear };
  });

  const [view, setView] = useState<'dashboard' | 'annual' | 'bets' | 'add' | 'markets' | 'methodologies' | 'tags' | 'leagues' | 'teams' | 'data'>('dashboard');
  const [showCSVModal, setShowCSVModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('betfair_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('betprofit_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('betfair_monthly_stakes', JSON.stringify(monthlyStakes));
    localStorage.setItem('betfair_monthly_bankrolls', JSON.stringify(monthlyBankrolls));
    localStorage.setItem('betfair_methodologies', JSON.stringify(methodologiesList));
    localStorage.setItem('betfair_tags', JSON.stringify(tagsList));
    localStorage.setItem('betfair_leagues', JSON.stringify(leaguesList));
  }, [monthlyStakes, monthlyBankrolls, methodologiesList, tagsList, leaguesList]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('betprofit_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('betprofit_auth');
  };

  const handleDataImport = (data: any) => {
    if (data.bets) setBets(data.bets);
    if (data.monthlyStakes) setMonthlyStakes(data.monthlyStakes);
    if (data.monthlyBankrolls) setMonthlyBankrolls(data.monthlyBankrolls);
    if (data.methodologies) setMethodologiesList(data.methodologies);
    if (data.tags) setTagsList(data.tags);
    if (data.leagues) setLeaguesList(data.leagues);
    setView('dashboard');
  };

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

  const stats: Stats = useMemo(() => {
    const total = filteredBets.length;
    if (total === 0) return { 
      totalBets: 0, 
      winRate: 0, 
      totalProfit: 0, 
      roi: 0, 
      yield: 0, 
      monthlyStake: currentMonthlyStake,
      monthlyBankroll: currentMonthlyBankroll,
      uniqueMarketsCount: 0,
      profitInStakes: 0
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

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const addBet = (bet: Bet) => {
    setBets(prev => [bet, ...prev]);
    setView('bets');
  };

  const updateBet = (id: string, updates: Partial<Bet>) => {
    setBets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBet = (id: string) => {
    setBets(prev => prev.filter(b => b.id !== id));
  };

  const updateMonthlyBankroll = (val: string) => {
    const num = parseFloat(val) || 0;
    setMonthlyBankrolls(prev => ({ ...prev, [monthKey]: num }));
  };

  const updateMonthlyStake = (val: string) => {
    const num = parseFloat(val) || 0;
    setMonthlyStakes(prev => ({ ...prev, [monthKey]: num }));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-4 sticky top-0 md:h-screen z-10 overflow-y-auto scrollbar-none">
        <div className="flex items-center gap-3 mb-8">
          <Logo size="sm" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
        </div>

        <div className="space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'dashboard' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-chart-pie"></i> Dashboard
          </button>
          <button onClick={() => setView('annual')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'annual' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-calendar"></i> Anual
          </button>
          <button onClick={() => setView('bets')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'bets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-list"></i> Histórico
          </button>
          <button onClick={() => setView('markets')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'markets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-bullseye"></i> Mercados
          </button>
          <button onClick={() => setView('leagues')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'leagues' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-trophy"></i> Campeonatos
          </button>
          <button onClick={() => setView('teams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'teams' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-users"></i> Equipas
          </button>
          <button onClick={() => setView('methodologies')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'methodologies' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-flask"></i> Métodos
          </button>
          <button onClick={() => setView('tags')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'tags' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-tags"></i> Tags
          </button>
          <button onClick={() => setView('data')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'data' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-database"></i> Dados
          </button>
          <button onClick={() => setView('add')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg ${view === 'add' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <i className="fas fa-plus-circle"></i> Registar
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-lg font-medium">
             <i className="fas fa-sign-out-alt"></i> Sair
           </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white capitalize">
              {view === 'dashboard' ? 'Visão Geral' : view === 'annual' ? 'Visão Anual' : view === 'bets' ? 'Histórico' : view === 'markets' ? 'Análise de Mercados' : view === 'methodologies' ? 'Gestão de Métodos' : view === 'tags' ? 'Análise por Tags' : view === 'leagues' ? 'Campeonatos' : view === 'teams' ? 'Equipas' : view === 'data' ? 'Base de Dados' : 'Nova Entrada'}
            </h2>
            <p className="text-slate-400 text-lg mt-1">{view === 'annual' ? `Ano de ${selectedDate.year}` : `${months[selectedDate.month]} ${selectedDate.year}`}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
              <label className="text-xs uppercase font-black text-slate-500 tracking-widest mr-1">Moeda:</label>
              <select 
                className="bg-transparent border-none text-yellow-400 font-bold text-lg focus:ring-0 cursor-pointer outline-none" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="€" className="bg-slate-900">€ (EUR)</option>
                <option value="R$" className="bg-slate-900">R$ (BRL)</option>
                <option value="$" className="bg-slate-900">$ (USD)</option>
                <option value="£" className="bg-slate-900">£ (GBP)</option>
              </select>
            </div>

            {view !== 'annual' && (
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
        {view === 'leagues' && <LeaguesView bets={filteredBets} available={leaguesList} onCreate={(l) => setLeaguesList([...leaguesList, l])} onDelete={(l) => setLeaguesList(leaguesList.filter(x => x !== l))} currency={currency} />}
        {view === 'teams' && <TeamsView bets={filteredBets} availableTeams={teamsList} currency={currency} />}
        {view === 'methodologies' && <MethodologiesView bets={filteredBets} available={methodologiesList} onCreate={(m) => setMethodologiesList([...methodologiesList, m])} onDelete={(m) => setMethodologiesList(methodologiesList.filter(x => x !== m))} currency={currency} />}
        {view === 'tags' && <TagsView bets={filteredBets} available={tagsList} onCreate={(t) => setTagsList([...tagsList, t])} onDelete={(t) => setTagsList(tagsList.filter(x => x !== t))} />}
        {view === 'data' && <DatabaseManager currentData={{ bets, monthlyStakes, monthlyBankrolls, methodologies: methodologiesList, tags: tagsList, leagues: leaguesList, teams: teamsList }} onDataImport={handleDataImport} />}
        {view === 'add' && <BetForm onAdd={addBet} onCancel={() => setView('dashboard')} monthlyStake={currentMonthlyStake} methodologies={methodologiesList} tags={tagsList} leagues={leaguesList} teams={teamsList} currency={currency} />}

        {showCSVModal && <CSVImporter onImport={(newBets) => { setBets(prev => [...newBets, ...prev]); setShowCSVModal(false); setView('bets'); }} onClose={() => setShowCSVModal(false)} monthlyStake={currentMonthlyStake} currency={currency} />}
      </main>
    </div>
  );
};

export default App;
