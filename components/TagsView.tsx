
import React, { useMemo, useState } from 'react';
import { Bet, BetStatus } from '../types';

interface TagsViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
}

const TagsView: React.FC<TagsViewProps> = ({ bets, available, onCreate, onDelete }) => {
  const [newTag, setNewTag] = useState('');

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    bets.forEach(bet => {
      const tags = bet.tags || [];
      tags.forEach(tag => {
        if (!map[tag]) {
          map[tag] = { bets: 0, profit: 0, won: 0, totalSettled: 0 };
        }
        const t = map[tag];
        t.bets += 1;
        t.profit += bet.profit;
        if (bet.status !== BetStatus.PENDING) {
          t.totalSettled += 1;
          // Fix: Use the correctly defined variable 't' instead of 'm'
          if (bet.status === BetStatus.WON) t.won += 1;
        }
      });
    });
    return map;
  }, [bets]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !available.includes(newTag.trim().toLowerCase())) {
      onCreate(newTag.trim().toLowerCase());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Form de Criação */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-tag text-yellow-400 text-sm"></i> Criar Nova Tag
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">#</span>
            <input 
              type="text" 
              placeholder="Live, PremierLeague, Stream..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-yellow-400"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
          </div>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg shadow-yellow-400/20 transition-all">
            Adicionar
          </button>
        </form>
      </div>

      {/* Grid de Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {available.map((tag, idx) => {
          const item = statsMap[tag] || { bets: 0, profit: 0, won: 0, totalSettled: 0 };
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          
          const isProfit = item.profit > 0.001;
          const isLoss = item.profit < -0.001;
          const hasActivity = item.bets > 0;

          // Mesma lógica de cores vibrantes: Emerald, Red e agora Yellow-400
          const barColor = isProfit ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : 'bg-yellow-400';
          const textColor = isProfit ? 'text-emerald-400' : isLoss ? 'text-red-500' : 'text-slate-400';
          
          const barOpacity = hasActivity ? 'opacity-100' : 'opacity-10';

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative">
              <button 
                onClick={() => onDelete(tag)}
                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <i className="fas fa-hashtag text-yellow-400 text-xs"></i>
                  <h3 className="font-bold text-white text-lg truncate max-w-[150px]">{tag}</h3>
                </div>
                <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">
                  {item.bets} {item.bets === 1 ? 'Entrada' : 'Entradas'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">Win Rate</p>
                    <p className="text-white font-mono font-bold text-lg">{winRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">P/L Acumulado</p>
                    <p className={`text-xl font-mono font-bold ${textColor}`}>
                      {isProfit ? '+' : ''}{item.profit.toFixed(2)}€
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${barColor} ${barOpacity}`} 
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TagsView;
