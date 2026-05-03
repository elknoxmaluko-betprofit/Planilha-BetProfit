import React, { useMemo, useState } from 'react';
import { Bet, BetStatus } from '../types';

interface MethodologiesViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  currency: string;
}

const MethodologiesView: React.FC<MethodologiesViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency }) => {
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    
    bets.forEach(bet => {
      const name = bet.methodology || 'Sem Método';
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

  const sorted = useMemo(() => {
    return [...available]
      .filter(name => statsMap[name]?.bets > 0)
      .sort((a, b) => (statsMap[b]?.profit || 0) - (statsMap[a]?.profit || 0));
  }, [available, statsMap]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((name, idx) => {
          const item = statsMap[name];
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          const roi = item.invested > 0 ? (item.profit / item.invested) * 100 : 0;

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                 <i className="fas fa-microscope text-4xl"></i>
              </div>
              <button 
                onClick={() => onDelete(name)}
                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 z-10"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
              
              <div className="flex items-center justify-between mb-4 relative z-10 w-full pr-10">
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
    </div>
  );
};

export default MethodologiesView;