import React, { useMemo, useState } from 'react';
import { Bet, BetStatus } from '../types';

interface MethodologiesViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  currency: string;
}

const MethodologiesView: React.FC<MethodologiesViewProps> = ({ bets, available, onCreate, onDelete, currency }) => {
  const [newName, setNewName] = useState('');

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    bets.forEach(bet => {
      const name = bet.methodology || 'Sem Método';
      if (!map[name]) {
        map[name] = { bets: 0, profit: 0, won: 0, totalSettled: 0 };
      }
      
      const m = map[name];
      m.bets += 1;
      m.profit += bet.profit;
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
    <div className="space-y-10">
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <i className="fas fa-flask text-yellow-400 text-lg"></i> Criar Novo Método
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Ex: Lay the Draw, Back Favorito HT..." 
            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 transition-all shadow-inner"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-400/20 transition-all active:scale-95">
            Adicionar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {available.map((name, idx) => {
          const item = statsMap[name] || { bets: 0, profit: 0, won: 0, totalSettled: 0 };
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          
          const isProfit = item.profit > 0.001;
          const isLoss = item.profit < -0.001;
          const hasActivity = item.bets > 0;

          const barColor = isProfit ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : 'bg-yellow-400';
          const textColor = isProfit ? 'text-emerald-400' : isLoss ? 'text-red-500' : 'text-slate-400';
          
          const barOpacity = hasActivity ? 'opacity-100' : 'opacity-10';

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-700 transition-all group relative shadow-lg">
              <button 
                onClick={() => onDelete(name)}
                className="absolute top-6 right-6 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <i className="fas fa-microscope text-yellow-400 text-sm"></i>
                  <h3 className="font-black text-white text-xl truncate max-w-[180px]">{name}</h3>
                </div>
                <span className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-black border border-slate-700 uppercase">
                  {item.bets} Registos
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-black mb-1.5 tracking-widest">Win Rate</p>
                    <p className="text-white font-mono font-black text-2xl">{winRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs uppercase font-black mb-1.5 tracking-widest">P/L Total</p>
                    <p className={`text-2xl font-mono font-black ${textColor}`}>
                      {isProfit ? '+' : ''}{item.profit.toFixed(2)}{currency}
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${barColor} ${barOpacity}`} 
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

export default MethodologiesView;