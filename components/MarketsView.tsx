
import React, { useMemo } from 'react';
import { Bet, MarketStats, BetStatus } from '../types';

interface MarketsViewProps {
  bets: Bet[];
  currency: string;
}

const MarketsView: React.FC<MarketsViewProps> = ({ bets, currency }) => {
  const { marketStats, htProfit, ftProfit, htCount, ftCount } = useMemo(() => {
    const map: Record<string, any> = {};
    let htTotal = 0;
    let ftTotal = 0;
    let htNum = 0;
    let ftNum = 0;
    
    bets.forEach(bet => {
      const isHT = bet.market.toUpperCase().includes('FIRST HALF');
      if (isHT) {
        htTotal += bet.profit;
        htNum += 1;
      } else {
        ftTotal += bet.profit;
        ftNum += 1;
      }

      if (!map[bet.market]) {
        map[bet.market] = { name: bet.market, bets: 0, profit: 0, winRate: 0, invested: 0 };
      }
      
      const stats = map[bet.market];
      stats.bets += 1;
      stats.profit += bet.profit;
      stats.invested += bet.stake;
    });

    const results = Object.values(map).map((m: any) => {
      const marketBets = bets.filter(b => b.market === m.name && b.status !== BetStatus.PENDING);
      const won = marketBets.filter(b => b.status === BetStatus.WON).length;
      m.winRate = marketBets.length > 0 ? (won / marketBets.length) * 100 : 0;
      m.roi = m.invested > 0 ? (m.profit / m.invested) * 100 : 0;
      return m;
    }).sort((a, b) => b.profit - a.profit);

    return { 
      marketStats: results, 
      htProfit: htTotal, 
      ftProfit: ftTotal,
      htCount: htNum,
      ftCount: ftNum
    };
  }, [bets]);

  return (
    <div className="space-y-10">
      {/* Resumo HT vs FT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between transition-all hover:border-slate-700 shadow-md">
          <div>
            <p className="text-white text-xs font-black uppercase tracking-[0.2em] mb-2">Total Lucro HT</p>
            <h3 className={`text-4xl font-mono font-black ${htProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {htProfit >= 0 ? '+' : ''}{htProfit.toFixed(2)}{currency}
            </h3>
            <p className="text-sm text-slate-400 font-bold mt-4 border-t border-slate-800 pt-3 flex items-center gap-2">
              <i className="fas fa-hashtag opacity-50"></i> {htCount} Operações
            </p>
          </div>
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-yellow-400 shadow-inner">
            <i className="fas fa-stopwatch text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center justify-between transition-all hover:border-slate-700 shadow-md">
          <div>
            <p className="text-white text-xs font-black uppercase tracking-[0.2em] mb-2">Total Lucro FT</p>
            <h3 className={`text-4xl font-mono font-black ${ftProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ftProfit >= 0 ? '+' : ''}{ftProfit.toFixed(2)}{currency}
            </h3>
            <p className="text-sm text-slate-400 font-bold mt-4 border-t border-slate-800 pt-3 flex items-center gap-2">
              <i className="fas fa-hashtag opacity-50"></i> {ftCount} Operações
            </p>
          </div>
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
            <i className="fas fa-flag-checkered text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Mercados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {marketStats.map((market, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h3 className="font-black text-white text-xl group-hover:text-yellow-400 transition-colors truncate max-w-[70%]">{market.name}</h3>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${market.profit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {market.bets} Operações
              </span>
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-white text-xs uppercase font-black tracking-widest mb-2">Taxa de Acerto</p>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${market.winRate}%` }}></div>
                  </div>
                  <span className="text-white font-mono font-black text-sm">{market.winRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-xs uppercase font-black tracking-widest mb-1.5">P/L Total</p>
                <p className={`text-2xl font-mono font-black ${market.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {market.profit >= 0 ? '+' : ''}{market.profit.toFixed(2)}{currency}
                </p>
                <p className={`text-xs font-mono font-bold ${market.roi >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'} mt-1`}>
                  {market.roi >= 0 ? '+' : ''}{market.roi.toFixed(1)}% Yield
                </p>
              </div>
            </div>

            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${market.name.toUpperCase().includes('FIRST HALF') ? 'bg-yellow-400/60' : 'bg-blue-400/60'}`}></div>
          </div>
        ))}

        {marketStats.length === 0 && (
          <div className="col-span-full py-28 text-center text-slate-500 italic flex flex-col items-center gap-6">
            <i className="fas fa-chart-bar text-6xl opacity-10"></i>
            <p className="text-xl font-medium">Sem dados para análise de mercados este mês.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketsView;
