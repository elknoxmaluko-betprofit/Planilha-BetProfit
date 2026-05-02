
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
    <div className="space-y-6 lg:space-y-10">
      {/* Resumo HT vs FT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] flex items-center justify-between transition-all hover:border-slate-700 shadow-md">
          <div>
            <p className="text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-2">Total Lucro HT</p>
            <h3 className={`text-2xl lg:text-4xl font-mono font-black ${htProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {htProfit >= 0 ? '+' : ''}{htProfit.toFixed(2)}{currency}
            </h3>
            <p className="text-xs lg:text-sm text-slate-400 font-bold mt-4 border-t border-slate-800 pt-3 flex items-center gap-2">
              <i className="fas fa-hashtag opacity-50"></i> {htCount} Operações
            </p>
          </div>
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-yellow-400 shadow-inner">
            <i className="fas fa-stopwatch text-xl lg:text-2xl"></i>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] flex items-center justify-between transition-all hover:border-slate-700 shadow-md">
          <div>
            <p className="text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] mb-2">Total Lucro FT</p>
            <h3 className={`text-2xl lg:text-4xl font-mono font-black ${ftProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {ftProfit >= 0 ? '+' : ''}{ftProfit.toFixed(2)}{currency}
            </h3>
            <p className="text-xs lg:text-sm text-slate-400 font-bold mt-4 border-t border-slate-800 pt-3 flex items-center gap-2">
              <i className="fas fa-hashtag opacity-50"></i> {ftCount} Operações
            </p>
          </div>
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
            <i className="fas fa-flag-checkered text-xl lg:text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Mercados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketStats.map((market, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <i className={`fas ${market.name.toUpperCase().includes('FIRST HALF') ? 'fa-stopwatch' : 'fa-flag-checkered'} text-4xl`}></i>
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="text-[10px] font-black text-slate-600 bg-slate-800 w-5 h-5 flex items-center justify-center rounded-full">
                {idx + 1}
              </span>
              <h3 className="font-bold text-white text-lg truncate pr-6">{market.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Yield / ROI</p>
                <p className={`font-mono font-bold ${market.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {market.roi >= 0 ? '+' : ''}{market.roi.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">P/L Líquido</p>
                <p className={`font-mono font-bold ${market.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {market.profit >= 0 ? '+' : ''}{market.profit.toFixed(2)}{currency}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{market.bets} Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${market.winRate}%` }}></div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">{market.winRate.toFixed(0)}% WR</span>
              </div>
            </div>
          </div>
        ))}

        {marketStats.length === 0 && (
          <div className="col-span-full py-20 lg:py-28 text-center text-slate-500 italic flex flex-col items-center gap-6">
            <i className="fas fa-chart-bar text-4xl lg:text-6xl opacity-10"></i>
            <p className="text-lg lg:text-xl font-medium">Sem dados para análise de mercados este mês.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketsView;
