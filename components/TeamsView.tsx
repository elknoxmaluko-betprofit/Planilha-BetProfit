
import React, { useMemo } from 'react';
import { Bet, BetStatus } from '../types';

interface TeamsViewProps {
  bets: Bet[];
  availableTeams: string[];
}

const TeamsView: React.FC<TeamsViewProps> = ({ bets, availableTeams }) => {
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
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <i className="fas fa-users text-4xl"></i>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-white text-lg truncate pr-6">{name}</h3>
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
                      {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}€
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
