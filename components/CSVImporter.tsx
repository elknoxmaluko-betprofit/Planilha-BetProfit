
import React, { useState, useRef } from 'react';
import { Bet, BetStatus, BetType } from '../types';

interface CSVImporterProps {
  onImport: (bets: Bet[]) => void;
  onClose: () => void;
  monthlyStake: number;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport, onClose, monthlyStake }) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Bet[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseBetfairDate = (dateStr: string) => {
    try {
      if (!isNaN(Date.parse(dateStr))) return new Date(dateStr).toISOString();

      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };

      const match = dateStr.match(/(\d{1,2})-(\w{3})-(\d{2,4})\s+(\d{1,2}:\d{2})/);
      if (match) {
        const [_, day, monthStr, yearShort, time] = match;
        const month = months[monthStr] || 0;
        const year = parseInt(yearShort) < 100 ? 2000 + parseInt(yearShort) : parseInt(yearShort);
        const [hours, minutes] = time.split(':');
        return new Date(year, month, parseInt(day), parseInt(hours), parseInt(minutes)).toISOString();
      }
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) throw new Error("O ficheiro está vazio ou mal formatado.");

      const headers = lines[0].replace(/^\uFEFF/, '').toLowerCase().split(',').map(h => h.trim());
      const bets: Bet[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => row[h] = values[idx]);

        const marketFull = row.market || "";
        const profitValue = parseFloat(row['profit/loss (€)'] || row.profit || "0");
        const dateRaw = row['settled date'] || row['start time'] || new Date().toISOString();

        let eventAndMarket = marketFull.includes('/') ? marketFull.split('/').slice(1).join('/').trim() : marketFull;
        let event = "Desconhecido";
        let marketName = "Match Odds";

        if (eventAndMarket.includes(':')) {
          const parts = eventAndMarket.split(':');
          event = parts[0].trim();
          marketName = parts[1].trim();
        } else {
          event = eventAndMarket.trim();
        }

        const profitPct = monthlyStake > 0 ? (profitValue / monthlyStake) * 100 : 0;

        const bet: Bet = {
          id: crypto.randomUUID(),
          date: parseBetfairDate(dateRaw),
          event,
          market: marketName,
          type: BetType.BACK,
          odds: 0,
          stake: monthlyStake, // Define a stake fixa do mês para cada aposta importada
          stakePercentage: 0,
          profit: isNaN(profitValue) ? 0 : profitValue,
          profitPercentage: profitPct,
          status: profitValue > 0 ? BetStatus.WON : profitValue < 0 ? BetStatus.LOST : BetStatus.VOID
        };

        bets.push(bet);
      }

      if (bets.length === 0) throw new Error("Não foram encontradas entradas válidas.");
      setPreview(bets);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao processar o CSV.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-file-invoice-dollar text-yellow-400"></i> Importar Extrato Betfair
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8">
          {preview.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-yellow-400/50 hover:bg-yellow-400/5 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-yellow-400 text-3xl group-hover:scale-110 transition-transform">
                <i className="fas fa-upload"></i>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">Arraste o seu extrato CSV aqui</p>
                <p className="text-slate-500 mt-2">Cada entrada será registada com a stake de {monthlyStake}€</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-emerald-500 text-xl"></i>
                  <div>
                    <p className="text-white font-bold">{preview.length} Entradas Identificadas</p>
                    <p className="text-emerald-500/80 text-xs">Atribuindo stake fixa de {monthlyStake}€ por operação</p>
                  </div>
                </div>
                <button onClick={() => setPreview([])} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-all">Trocar Ficheiro</button>
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-2xl scrollbar-thin scrollbar-thumb-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-slate-400 font-semibold">Data</th>
                      <th className="p-4 text-slate-400 font-semibold">Jogo / Evento</th>
                      <th className="p-4 text-slate-400 font-semibold">Mercado</th>
                      <th className="p-4 text-slate-400 font-semibold text-right">P/L (€)</th>
                      <th className="p-4 text-slate-400 font-semibold text-right">% ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {preview.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-4 text-slate-400">{new Date(b.date).toLocaleDateString('pt-PT')}</td>
                        <td className="p-4 text-slate-200 font-medium">{b.event}</td>
                        <td className="p-4">
                          <span className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-700">
                            {b.market}
                          </span>
                        </td>
                        <td className={`p-4 text-right font-mono font-bold text-sm ${b.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {b.profit > 0 ? '+' : ''}{b.profit.toFixed(2)}€
                        </td>
                        <td className={`p-4 text-right font-mono font-bold text-sm ${b.profitPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {b.profitPercentage > 0 ? '+' : ''}{b.profitPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-8 py-2.5 font-bold text-slate-400 hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={() => onImport(preview)} 
            disabled={preview.length === 0}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 px-10 py-2.5 rounded-xl font-bold shadow-xl shadow-yellow-400/20 transition-all active:scale-95"
          >
            Confirmar e Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;
