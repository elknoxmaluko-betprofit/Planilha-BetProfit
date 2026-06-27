import React, { useMemo, useState, useEffect } from 'react';
import { Bet, BetStatus } from '../types';
import ConfirmModal from './ConfirmModal';
import LogoEditModal from './LogoEditModal';

interface LeaguesViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  currency: string;
}

const LEAGUE_NAMES_MAP: Record<string, string> = {
  'italiano': 'Serie A Italy football logo',
  'itália 1': 'Serie A Italy football logo',
  'italia 1': 'Serie A Italy football logo',
  'italia 2': 'Serie B Italy football logo',
  'itália 2': 'Serie B Italy football logo',
  'brasil 1': 'Brasileirão Série A logo',
  'brasil 2': 'Brasileirão Série B logo',
  'portugal 1': 'Liga Portugal Betclic logo',
  'portugal 2': 'Liga Portugal 2 logo',
  'frança 1': 'Ligue 1 France football logo',
  'franca 1': 'Ligue 1 France football logo',
  'frança 2': 'Ligue 2 France football logo',
  'franca 2': 'Ligue 2 France football logo',
  'espanha 1': 'LaLiga EA Sports Spain logo',
  'espanha 2': 'LaLiga Hypermotion Spain logo',
  'alemanha 1': 'Bundesliga Germany logo',
  'alemanha 2': '2. Bundesliga Germany logo',
  'inglaterra 1': 'Premier League logo',
  'inglaterra 2': 'EFL Championship England logo',
  'holanda 1': 'Eredivisie logo',
  'turquia 1': 'Süper Lig Turkey logo',
  'grécia 1': 'Super League Greece logo',
  'grecia 1': 'Super League Greece logo',
  'roménia 1': 'Liga I Romania football logo',
  'romenia 1': 'Liga I Romania football logo',
  'argentina 1': 'Argentine Primera División logo',
  'champions league': 'UEFA Champions League logo',
  'europa league': 'UEFA Europa League logo',
  'conference league': 'UEFA Conference League logo',
  'taça de portugal': 'Taça de Portugal logo',
  'taça da alemanha': 'DFB-Pokal logo',
  'taca da alemanha': 'DFB-Pokal logo',
  'taça de frança': 'Coupe de France logo',
  'taca de franca': 'Coupe de France logo',
  'taça da inglaterra': 'FA Cup logo',
  'taca da inglaterra': 'FA Cup logo',
  'premier league': 'Premier League logo',
  'laliga': 'LaLiga logo',
  'bundesliga': 'Bundesliga logo',
  'serie a': 'Serie A Italy logo',
  'brasileirão': 'Brasileirão Série A logo'
};

const LeagueBadge: React.FC<{ leagueName: string }> = ({ leagueName }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const cleanName = leagueName.toLowerCase().trim();
  const cacheKey = `betprofit_league_logo_${cleanName}`;

  useEffect(() => {
    let isMounted = true;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      if (cached === 'NOT_FOUND') {
        setError(true);
      } else {
        setLogoUrl(cached);
        setError(false);
      }
      setLoading(false);
      return;
    }

    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(false);

        // Termo de pesquisa otimizado
        let searchQuery = LEAGUE_NAMES_MAP[cleanName];
        if (!searchQuery) {
          const match = cleanName.match(/^([a-zà-ú\s]+)\s+(\d)$/i);
          if (match) {
            const country = match[1].trim();
            const div = match[2];
            if (div === '1') {
              searchQuery = `${country} top division football league logo`;
            } else if (div === '2') {
              searchQuery = `${country} second division football league logo`;
            } else {
              searchQuery = `${leagueName} football league logo`;
            }
          } else {
            searchQuery = `${leagueName} football league logo`;
          }
        }

        // 1ª Tentativa: TheSportsDB API direta pelo nome da liga
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchleagues.php?l=${encodeURIComponent(leagueName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.leagues && data.leagues.length > 0) {
            const badge = data.leagues[0].strBadge || data.leagues[0].strLogo || data.leagues[0].strTrophy;
            if (badge) {
              if (isMounted) {
                setLogoUrl(badge);
                setLoading(false);
              }
              localStorage.setItem(cacheKey, badge);
              return;
            }
          }
        }

        // 2ª Tentativa: Wikipedia API com termo traduzido/otimizado
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1&prop=pageimages&pithumbsize=100&format=json&origin=*`);
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.query && wikiData.query.pages) {
            const pages = Object.values(wikiData.query.pages) as any[];
            if (pages.length > 0 && pages[0].thumbnail?.source) {
              const badge = pages[0].thumbnail.source;
              if (isMounted) {
                setLogoUrl(badge);
                setLoading(false);
              }
              localStorage.setItem(cacheKey, badge);
              return;
            }
          }
        }

        if (isMounted) {
          setError(true);
          setLoading(false);
        }
        localStorage.setItem(cacheKey, 'NOT_FOUND');
      } catch (e) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchLogo();
    return () => { isMounted = false; };
  }, [leagueName, refreshKey]);

  const handleUpdateLogo = (newUrl: string | null) => {
    if (newUrl) {
      setLogoUrl(newUrl);
      setError(false);
    } else {
      setLogoUrl(null);
      setError(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 animate-pulse border border-slate-700/50 flex items-center justify-center shadow-inner">
          <i className="fas fa-circle-notch fa-spin text-slate-600 text-lg"></i>
        </div>
      );
    }

    if (error || !logoUrl) {
      const words = leagueName.trim().split(/\s+/);
      let initials = '';
      if (words.length === 1) {
        initials = words[0].substring(0, 3).toUpperCase();
      } else if (words.length === 2 && !isNaN(Number(words[1]))) {
        initials = words[0].substring(0, 3).toUpperCase() + words[1];
      } else {
        initials = words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
      }

      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex flex-col items-center justify-center text-slate-400 shadow-md group-hover/badge:border-slate-500 transition-colors">
          <i className="fas fa-trophy text-xl text-yellow-500/80 mb-1"></i>
          <span className="text-xs font-black tracking-tighter text-slate-300 leading-none">{initials}</span>
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-700/60 p-2 flex items-center justify-center shadow-md overflow-hidden group-hover/badge:border-slate-500 transition-all">
        <img 
          src={logoUrl} 
          alt={leagueName} 
          className="max-w-full max-h-full object-contain filter drop-shadow" 
          referrerPolicy="no-referrer"
          onError={() => {
            setError(true);
            localStorage.setItem(cacheKey, 'NOT_FOUND');
          }}
        />
      </div>
    );
  };

  return (
    <>
      <div 
        onClick={() => setIsEditOpen(true)}
        className="relative group/badge cursor-pointer"
        title="Clicar para alterar ou personalizar logotipo"
      >
        {renderContent()}
        <div className="absolute inset-0 rounded-2xl bg-slate-950/70 opacity-0 group-hover/badge:opacity-100 flex flex-col items-center justify-center text-yellow-400 transition-all z-10 backdrop-blur-[1px]">
          <i className="fas fa-camera text-sm mb-0.5"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Editar</span>
        </div>
      </div>

      <LogoEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        entityName={leagueName}
        cacheKey={cacheKey}
        onUpdateLogo={handleUpdateLogo}
      />
    </>
  );
};

const LeaguesView: React.FC<LeaguesViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency }) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    bets.forEach(bet => {
      const name = bet.league || 'Sem Campeonato';
      if (!map[name]) {
        map[name] = { bets: 0, profit: 0, won: 0, totalSettled: 0, invested: 0 };
      }
      const m = map[name];
      m.bets += 1;
      m.profit += bet.profit;
      m.invested += bet.stake;
      if (bet.status !== BetStatus.PENDING) {
        m.totalSettled += 1;
        if (bet.status === BetStatus.WON) m.won += 1;
      }
    });
    return map;
  }, [bets]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && !available.includes(newName.trim())) {
      onCreate(newName.trim());
      setNewName('');
    }
  };

  const handleEditSubmit = (e: React.FormEvent, oldName: string) => {
    e.preventDefault();
    if (editValue.trim() && editValue.trim() !== oldName) {
      onEdit(oldName, editValue.trim());
    }
    setEditingName(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-trophy text-yellow-400 text-sm"></i> Adicionar Novo Campeonato
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Ex: Premier League, Champions League, Liga Portugal..." 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-400 transition-colors"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all">
            Adicionar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...available].sort((a, b) => {
          const profitA = statsMap[a] ? statsMap[a].profit : 0;
          const profitB = statsMap[b] ? statsMap[b].profit : 0;
          return profitB - profitA;
        }).map((name, idx) => {
          const item = statsMap[name] || { bets: 0, profit: 0, won: 0, totalSettled: 0, invested: 0 };
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          const roi = item.invested > 0 ? (item.profit / item.invested) * 100 : 0;

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-5 right-5 z-10">
                 <LeagueBadge leagueName={name} />
              </div>
              <button onClick={() => setDeletingName(name)} className="absolute top-2 right-2 bg-slate-900/90 hover:bg-red-500 hover:text-white text-slate-400 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow"><i className="fas fa-times text-xs"></i></button>
              
              <div className="flex items-center justify-between mb-4 relative z-10 w-full pr-20">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                    {idx + 1}
                  </span>
                  
                  {editingName === name ? (
                    <form onSubmit={(e) => handleEditSubmit(e, name)} className="flex-1 flex items-center gap-2">
                       <input 
                         autoFocus
                         type="text" 
                         value={editValue} 
                         onChange={e => setEditValue(e.target.value)} 
                         onBlur={() => setEditingName(null)}
                         className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm outline-none w-full"
                       />
                    </form>
                  ) : (
                    <h3 className="font-bold text-white text-lg truncate flex-1 flex items-center gap-2 group/edit cursor-pointer" onClick={() => { setEditingName(name); setEditValue(name); }}>
                      {name}
                      <i className="fas fa-pen text-[10px] text-slate-600 opacity-0 group-hover/edit:opacity-100 transition-opacity"></i>
                    </h3>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Yield / ROI</p>
                  <p className={`font-mono font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">P/L Líquido</p>
                  <p className={`font-mono font-bold ${item.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}{currency}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{item.bets} Entradas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${winRate}%` }}></div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">{winRate.toFixed(0)}% WR</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <ConfirmModal
        isOpen={deletingName !== null}
        title="Confirmar Eliminação"
        message={`Tem a certeza que pretende eliminar o campeonato "${deletingName}"? Esta ação não afetará as apostas já guardadas com este campeonato.`}
        onConfirm={() => {
          if (deletingName) onDelete(deletingName);
          setDeletingName(null);
        }}
        onCancel={() => setDeletingName(null)}
      />
    </div>
  );
};

export default LeaguesView;