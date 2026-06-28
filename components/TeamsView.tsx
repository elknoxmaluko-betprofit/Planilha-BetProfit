import React, { useMemo, useState, useEffect } from 'react';
import { Bet, BetStatus } from '../types';
import LogoEditModal from './LogoEditModal';

interface TeamsViewProps {
  bets: Bet[];
  availableTeams: string[];
  currency: string;
}

export const TeamBadge: React.FC<{ teamName: string; size?: 'sm' | 'md'; editable?: boolean }> = ({ teamName, size = 'md', editable = true }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const cleanName = teamName.toLowerCase().trim();
  const cacheKey = `betprofit_logo_${cleanName}`;

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
        // 1ª Tentativa: TheSportsDB API (Fuzzy search gratuita de desporto)
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.teams && data.teams.length > 0) {
            const badge = data.teams[0].strBadge || data.teams[0].strLogo;
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

        // 2ª Tentativa: Wikipedia API (pesquisa de imagem)
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(teamName + ' football crest logo')}&gsrlimit=1&prop=pageimages&pithumbsize=100&format=json&origin=*`);
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
  }, [teamName, refreshKey]);

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
    const boxSize = size === 'sm' ? 'w-9 h-9 rounded-xl' : 'w-20 h-20 rounded-2xl';

    if (loading) {
      return (
        <div className={`${boxSize} bg-slate-800/80 animate-pulse border border-slate-700/50 flex items-center justify-center shadow-inner`}>
          <i className={`fas fa-circle-notch fa-spin text-slate-600 ${size === 'sm' ? 'text-xs' : 'text-lg'}`}></i>
        </div>
      );
    }

    if (error || !logoUrl) {
      const initials = teamName
        .split(/\s+/)
        .map(w => w[0])
        .join('')
        .substring(0, 3)
        .toUpperCase();

      return (
        <div className={`${boxSize} bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex flex-col items-center justify-center text-slate-400 shadow-md group-hover/badge:border-slate-500 transition-colors`}>
          <i className={`fas fa-shield-alt text-yellow-500/80 ${size === 'sm' ? 'text-xs mb-0' : 'text-xl mb-1'}`}></i>
          {size !== 'sm' && <span className="text-xs font-black tracking-tighter text-slate-300 leading-none">{initials}</span>}
        </div>
      );
    }

    return (
      <div className={`${boxSize} bg-slate-900/80 border border-slate-700/60 ${size === 'sm' ? 'p-1' : 'p-2'} flex items-center justify-center shadow-md overflow-hidden group-hover/badge:border-slate-500 transition-all`}>
        <img 
          src={logoUrl} 
          alt={teamName} 
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

  if (!editable) {
    return renderContent();
  }

  return (
    <>
      <div 
        onClick={() => setIsEditOpen(true)}
        className="relative group/badge cursor-pointer inline-block"
        title="Clicar para alterar ou personalizar logotipo"
      >
        {renderContent()}
        <div className={`absolute inset-0 ${size === 'sm' ? 'rounded-xl' : 'rounded-2xl'} bg-slate-950/80 opacity-0 group-hover/badge:opacity-100 flex flex-col items-center justify-center text-yellow-400 transition-all z-10 backdrop-blur-[1px]`}>
          <i className={`fas fa-camera ${size === 'sm' ? 'text-[10px]' : 'text-sm mb-0.5'}`}></i>
          {size !== 'sm' && <span className="text-[8px] font-black uppercase tracking-tighter">Editar</span>}
        </div>
      </div>

      <LogoEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        entityName={teamName}
        cacheKey={cacheKey}
        onUpdateLogo={handleUpdateLogo}
      />
    </>
  );
};

const TeamsView: React.FC<TeamsViewProps> = ({ bets, availableTeams, currency }) => {
  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    // Processamos cada equipa da lista disponível (que já vem descoberta do App.tsx)
    availableTeams.forEach(teamName => {
      if (!map[teamName]) {
        map[teamName] = { bets: 0, profit: 0, won: 0, totalSettled: 0, invested: 0 };
      }
      
      // Para cada equipa, procuramos apostas que envolvam o seu nome no evento ou campo team
      bets.forEach(bet => {
        const isInEvent = bet.event.toLowerCase().includes(teamName.toLowerCase());
        const isSelectedTeam = bet.team === teamName;

        if (isInEvent || isSelectedTeam) {
          const m = map[teamName];
          m.bets += 1;
          m.profit += bet.profit;
          m.invested += bet.stake;
          if (bet.status !== BetStatus.PENDING) {
            m.totalSettled += 1;
            if (bet.status === BetStatus.WON) m.won += 1;
          }
        }
      });
    });
    return map;
  }, [bets, availableTeams]);

  // Ordenar equipas por lucro (descendente)
  const sortedTeams = useMemo(() => {
    return [...availableTeams]
      .filter(name => statsMap[name]?.bets > 0) // Apenas equipas com atividade no período
      .sort((a, b) => (statsMap[b]?.profit || 0) - (statsMap[a]?.profit || 0));
  }, [availableTeams, statsMap]);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fas fa-users text-yellow-400 text-sm"></i> Equipas Identificadas
            </h3>
            <p className="text-slate-500 text-xs mt-1">Ordenadas pelos maiores ganhos registados nas suas entradas.</p>
          </div>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700 uppercase">
            {sortedTeams.length} Equipas Ativas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeams.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 italic">
            Nenhuma equipa detetada nas entradas deste mês.
          </div>
        ) : (
          sortedTeams.map((name, idx) => {
            const item = statsMap[name];
            const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
            const roi = item.invested > 0 ? (item.profit / item.invested) * 100 : 0;

            return (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">
                <div className="absolute top-5 right-5 z-10">
                   <TeamBadge teamName={name} />
                </div>
                
                <div className="flex items-center gap-2 mb-4 pr-24">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-800 w-5 h-5 flex shrink-0 items-center justify-center rounded-full">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white text-lg truncate" title={name}>{name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{item.bets} Jogos</span>
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
          })
        )}
      </div>
    </div>
  );
};

export default TeamsView;