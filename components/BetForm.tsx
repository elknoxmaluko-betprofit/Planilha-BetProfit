
import React, { useState, useEffect } from 'react';
import { Bet, BetStatus, BetType } from '../types';

interface BetFormProps {
  onAdd: (bet: Bet) => void;
  onCancel: () => void;
  monthlyStake: number;
  methodologies: string[];
  tags: string[];
  leagues: string[];
  teams: string[];
  currency: string;
}

const BetForm: React.FC<BetFormProps> = ({ onAdd, onCancel, monthlyStake, methodologies, tags, leagues, teams, currency }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
    market: '',
    type: BetType.BACK,
    stake: monthlyStake,
    profit: 0,
    methodology: methodologies[0] || '',
    league: leagues[0] || '',
    team: teams[0] || '',
    selectedTags: [] as string[]
  });

  useEffect(() => {
    if (monthlyStake > 0) {
      setFormData(prev => ({ ...prev, stake: monthlyStake }));
    }
  }, [monthlyStake]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event) return;

    const status = formData.profit > 0 ? BetStatus.WON : 
                   formData.profit < 0 ? BetStatus.LOST : 
                   formData.profit === 0 && formData.stake > 0 ? BetStatus.VOID : BetStatus.PENDING;

    const profitPercentage = formData.stake > 0 ? (formData.profit / formData.stake) * 100 : 0;

    const newBet: Bet = {
      id: crypto.randomUUID(),
      date: formData.date,
      event: formData.event,
      market: formData.market,
      type: formData.type,
      stake: formData.stake,
      profit: formData.profit,
      odds: 0,
      stakePercentage: 0,
      profitPercentage: profitPercentage,
      status,
      methodology: formData.methodology,
      league: formData.league,
      team: formData.team,
      tags: formData.selectedTags
    };

    onAdd(newBet);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 max-w-3xl mx-auto shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
        <i className="fas fa-file-signature text-yellow-400"></i> Registar Nova Operação
      </h3>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Data</label>
            <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Jogo / Evento</label>
            <input type="text" placeholder="Ex: Porto vs Benfica" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.event} onChange={e => setFormData({ ...formData, event: e.target.value })} required />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mercado</label>
            <input type="text" placeholder="Ex: Match Odds" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.market} onChange={e => setFormData({ ...formData, market: e.target.value })} required />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tipo</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none shadow-inner" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as BetType })}>
              <option value={BetType.BACK}>BACK (A Favor)</option>
              <option value={BetType.LAY}>LAY (Contra)</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Campeonato</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.league} onChange={e => setFormData({ ...formData, league: e.target.value })}>
              <option value="">Sem Campeonato</option>
              {leagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Equipa</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.team} onChange={e => setFormData({ ...formData, team: e.target.value })}>
              <option value="">Sem Equipa</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Método</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg outline-none focus:border-yellow-400 shadow-inner" value={formData.methodology} onChange={e => setFormData({ ...formData, methodology: e.target.value })}>
              <option value="">Sem Método</option>
              {methodologies.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Stake ({currency})</label>
            <input type="number" step="0.01" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-lg font-mono outline-none shadow-inner" value={formData.stake || ''} onChange={e => setFormData({ ...formData, stake: parseFloat(e.target.value) })} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tags</label>
          <div className="flex flex-wrap gap-3 p-6 bg-slate-800/50 rounded-[2rem] border border-slate-700 shadow-inner">
            {tags.map(tag => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-4 py-2 rounded-xl text-sm font-black transition-all border ${formData.selectedTags.includes(tag) ? 'bg-yellow-400 text-slate-900 border-yellow-400 shadow-lg shadow-yellow-400/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Resultado Final ({currency})</label>
          <input type="number" step="0.01" className={`w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-5 font-mono font-black text-2xl outline-none transition-all shadow-inner ${formData.profit > 0 ? 'text-emerald-400 border-emerald-500/40' : formData.profit < 0 ? 'text-red-400 border-red-500/40' : 'text-white'}`} value={formData.profit || ''} onChange={e => setFormData({ ...formData, profit: parseFloat(e.target.value) || 0 })} />
        </div>

        <div className="flex gap-6 pt-6">
          <button type="button" onClick={onCancel} className="flex-1 px-8 py-5 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 text-lg transition-all">Cancelar</button>
          <button type="submit" className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-yellow-400/20 active:scale-95 transition-all">Guardar Operação</button>
        </div>
      </form>
    </div>
  );
};

export default BetForm;
