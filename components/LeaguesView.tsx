import React, { useMemo, useState } from 'react';
import { Bet, BetStatus } from '../types';

interface LeaguesViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  currency: string;
}

const LeaguesView: React.FC<LeaguesViewProps> = ({ bets, available, onCreate, onDelete, currency }) => {
  const [newName, setNewName] = useState('');

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
        {available.map((name, idx) => {
          const item = statsMap[name] || { bets: 0, profit: 0, won: 0, totalSettled: 0, invested: 0 };
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          const roi = item.invested > 0 ? (item.profit / item.invested) * 100 : 0;

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative">
              <button onClick={() => onDelete(name)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 p-2"><i className="fas fa-times"></i></button>
              <h3 className="font-bold text-white text-lg mb-4 truncate pr-6">{name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ROI / Yield</p>
                  <p className={`font-mono font-bold ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{roi.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">P/L Total</p>
                  <p className={`font-mono font-bold ${item.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.profit.toFixed(2)}{currency}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.bets} Entradas</span>
                <span className="text-[10px] text-blue-400 font-bold uppercase">{winRate.toFixed(0)}% WR</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaguesView;