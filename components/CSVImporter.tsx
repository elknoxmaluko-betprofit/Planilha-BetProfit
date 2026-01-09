import React, { useState, useRef } from 'react';
import { Bet, BetStatus, BetType } from '../types';

interface CSVImporterProps {
  onImport: (bets: Bet[]) => void;
  onClose: () => void;
  monthlyStake: number;
  currency: string;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport, onClose, monthlyStake, currency }) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Bet[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseBetfairDate = (dateStr: string) => {
    try {
      if (!dateStr) return new Date().toISOString();
      
      // Tenta parse direto primeiro (ISO)
      const directDate = Date.parse(dateStr);
      if (!isNaN(directDate) && dateStr.includes('-') && dateStr.length > 10) {
         return new Date(dateStr).toISOString();
      }

      const cleanDateStr = dateStr.toLowerCase().trim();
      
      const months: Record<string, number> = {
        // EN
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
        // PT
        'fev': 1, 'abr': 3, 'mai': 4, 'ago': 7, 'set': 8, 'out': 9, 'dez': 11
      };

      // Formato esperado: "09-jan-26 13:00" ou "09-jan-2026 13:00"
      const match = cleanDateStr.match(/(\d{1,2})[/-]([a-z]{3})[/-](\d{2,4})\s+(\d{1,2}:\d{2})/);
      
      if (match) {
        const [_, day, monthStr, yearShort, time] = match;
        const month = months[monthStr] || 0;
        let year = parseInt(yearShort);
        if (year < 100) year += 2000;
        
        const [hours, minutes] = time.split(':');
        return new Date(year, month, parseInt(day), parseInt(hours), parseInt(minutes)).toISOString();
      }
      
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const normalizeHeader = (header: string): string => {
    const h = header.toLowerCase().trim();
    if (h.includes('lucro') || h.includes('profit') || h.includes('p/l')) return 'profit';
    if (h.includes('data') || h.includes('date') || h.includes('resolução') || h.includes('start time')) return 'date';
    if (h.includes('mercado') || h.includes('market') || h.includes('descrição')) return 'market';
    return h;
  };

  const parseCurrencyValue = (val: string): number => {
    if (!val) return 0;
    // Remove símbolos de moeda e espaços (R$, $, £, €, etc)
    // Mantém números, pontos, vírgulas e sinal de menos
    let clean = val.replace(/[^\d.,-]/g, '');
    
    // Detetar formato decimal
    // Se tiver vírgula e ponto (ex: 1.000,50), remove ponto e troca vírgula por ponto
    if (clean.includes(',') && clean.includes('.')) {
       if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
          // Formato Europeu/BR: 1.234,56 -> remove . -> troca , por .
          clean = clean.replace(/\./g, '').replace(',', '.');
       } else {
          // Formato US invertido (raro): 1,234.56 -> remove ,
          clean = clean.replace(/,/g, '');
       }
    } else if (clean.includes(',')) {
       // Apenas vírgula (ex: 1,50) -> troca por ponto
       clean = clean.replace(',', '.');
    }
    
    // Se sobrar apenas ponto sem decimais (ex: 1.000), verificar contexto, mas geralmente parseFloat resolve
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) throw new Error("O ficheiro está vazio ou mal formatado.");

      // Detetar delimitador (Vírgula ou Ponto e Vírgula)
      const firstLine = lines[0];
      const separator = firstLine.includes(';') && (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ',';

      // Regex para dividir respeitando aspas: split por separador apenas se não estiver dentro de aspas
      const splitRegex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);

      // Mapear cabeçalhos
      const rawHeaders = firstLine.replace(/^\uFEFF/, '').split(splitRegex).map(h => h.trim().replace(/^"|"$/g, ''));
      const headerMap: Record<string, number> = {};
      
      rawHeaders.forEach((h, index) => {
        const normalized = normalizeHeader(h);
        if (normalized === 'profit' || normalized === 'date' || normalized === 'market') {
            headerMap[normalized] = index;
        }
      });

      if (headerMap['market'] === undefined && headerMap['profit'] === undefined) {
         throw new Error("Não foi possível identificar as colunas de 'Mercado' ou 'Lucro'. Verifique o cabeçalho do CSV.");
      }

      const bets: Bet[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Dividir linha
        const cols = line.split(splitRegex).map(c => c.trim().replace(/^"|"$/g, ''));
        
        // Extrair dados
        const marketRaw = cols[headerMap['market']] || "";
        const dateRaw = cols[headerMap['date']] || new Date().toISOString();
        const profitRaw = cols[headerMap['profit']] || "0";

        // Processar Mercado e Evento
        let event = "Desconhecido";
        let marketName = "Match Odds";
        
        // Lógica para limpar o nome do mercado (padrão Betfair)
        // Ex: "Futebol / Mali x Senegal : Mais/Menos de 1,5 Gols"
        let cleanMarket = marketRaw;
        
        // Se tiver barras, geralmente a estrutura é Desporto / Evento / Mercado ou Desporto / Evento : Mercado
        if (cleanMarket.includes('/')) {
            const parts = cleanMarket.split('/');
            // Pega a última parte ou penúltima dependendo da estrutura
            cleanMarket = parts.slice(1).join('/').trim(); 
        }

        if (cleanMarket.includes(':')) {
            const parts = cleanMarket.split(':');
            event = parts[0].trim();
            marketName = parts[1].trim();
        } else {
            // Tenta adivinhar se não tiver dois pontos
            event = cleanMarket;
        }

        const profitValue = parseCurrencyValue(profitRaw);
        const profitPct = monthlyStake > 0 ? (profitValue / monthlyStake) * 100 : 0;

        const bet: Bet = {
          id: crypto.randomUUID(),
          date: parseBetfairDate(dateRaw),
          event,
          market: marketName,
          type: BetType.BACK, // CSV não costuma dizer se foi Back/Lay explicitamente na linha resumida, assume Back por defeito ou indiferente
          odds: 0,
          stake: monthlyStake, 
          stakePercentage: 0,
          profit: profitValue,
          profitPercentage: profitPct,
          status: profitValue > 0 ? BetStatus.WON : profitValue < 0 ? BetStatus.LOST : BetStatus.VOID
        };

        bets.push(bet);
      }

      if (bets.length === 0) throw new Error("Não foram encontradas entradas válidas.");
      setPreview(bets);
      setError(null);
    } catch (err: any) {
      console.error(err);
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
    reader.readAsText(file); // CSV é texto
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-file-invoice-dollar text-yellow-400"></i> Importar Extrato (Betfair / Punter)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8">
          {preview.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-yellow-400/50 hover:bg-yellow-400/5 rounded-3xl p-12 lg:p-16 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all group"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-yellow-400 text-4xl group-hover:scale-110 transition-transform shadow-lg">
                <i className="fas fa-upload"></i>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white font-bold text-xl lg:text-2xl">Carregar ficheiro CSV</p>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Suporta extratos da Betfair em <span className="text-yellow-400 font-bold">Português ou Inglês</span>.
                  Reconhece automaticamente R$, $, £ e €.
                </p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{preview.length} Entradas Encontradas</p>
                    <p className="text-emerald-500/80 text-xs font-mono">Stake atribuída: {monthlyStake}{currency}</p>
                  </div>
                </div>
                <button onClick={() => setPreview([])} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-all font-bold border border-slate-700">
                   <i className="fas fa-sync-alt mr-2"></i> Trocar Ficheiro
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto border border-slate-800 rounded-2xl scrollbar-thin scrollbar-thumb-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Data</th>
                      <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Evento</th>
                      <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Mercado</th>
                      <th className="p-4 text-slate-400 font-bold uppercase tracking-wider text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {preview.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-slate-400 font-mono">{new Date(b.date).toLocaleDateString('pt-PT')}</td>
                        <td className="p-4 text-white font-bold">{b.event}</td>
                        <td className="p-4">
                          <span className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700 font-bold">
                            {b.market}
                          </span>
                        </td>
                        <td className={`p-4 text-right font-mono font-bold text-sm ${b.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {b.profit > 0 ? '+' : ''}{b.profit.toFixed(2)}{currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
              <i className="fas fa-exclamation-triangle text-lg"></i> 
              <span className="font-bold">{error}</span>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-8 py-3 font-bold text-slate-400 hover:text-white transition-all">Cancelar</button>
          <button 
            onClick={() => onImport(preview)} 
            disabled={preview.length === 0}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-10 py-3 rounded-xl font-black shadow-xl shadow-yellow-400/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-save"></i> Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;