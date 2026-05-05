
import React, { useMemo, useState } from 'react';
import { Bet, BetStatus } from '../types';
import ConfirmModal from './ConfirmModal';

interface TagsViewProps {
  bets: Bet[];
  available: string[];
  onCreate: (name: string) => void;
  onDelete: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  currency: string;
}

const TagsView: React.FC<TagsViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency }) => {
  const [newTag, setNewTag] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    bets.forEach(bet => {
      const tags = bet.tags || [];
      tags.forEach(tag => {
        if (!map[tag]) {
          map[tag] = { bets: 0, profit: 0, won: 0, totalSettled: 0, invested: 0 };
        }
        const t = map[tag];
        t.bets += 1;
        t.profit += bet.profit;
        t.invested += bet.stake;
        if (bet.status !== BetStatus.PENDING) {
          t.totalSettled += 1;
          if (bet.status === BetStatus.WON) t.won += 1;
        }
      });
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
    if (newTag.trim() && !available.includes(newTag.trim().toLowerCase())) {
      onCreate(newTag.trim().toLowerCase());
      setNewTag('');
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
        {sorted.map((tag, idx) => {
          const item = statsMap[tag];
          const winRate = item.totalSettled > 0 ? (item.won / item.totalSettled) * 100 : 0;
          const roi = item.invested > 0 ? (item.profit / item.invested) * 100 : 0;

          return (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                 <i className="fas fa-hashtag text-4xl"></i>
              </div>
              <button 
                onClick={() => setDeletingName(tag)}
                className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div className="flex items-center justify-between mb-4 relative z-10 w-full pr-10">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                    {idx + 1}
                  </span>
                  
                  {editingName === tag ? (
                    <form onSubmit={(e) => handleEditSubmit(e, tag)} className="flex-1 flex items-center gap-2">
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
                    <h3 className="font-bold text-white text-lg truncate flex-1 flex items-center gap-2 group/edit cursor-pointer" onClick={() => { setEditingName(tag); setEditValue(tag); }}>
                      {tag}
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
        message={`Tem a certeza que pretende eliminar a tag "${deletingName}"? Esta ação não afetará as apostas já guardadas com esta tag.`}
        onConfirm={() => {
          if (deletingName) onDelete(deletingName);
          setDeletingName(null);
        }}
        onCancel={() => setDeletingName(null)}
      />
    </div>
  );
};

export default TagsView;
