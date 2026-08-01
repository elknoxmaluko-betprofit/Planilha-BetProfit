import React, { useMemo } from 'react';
import { Bet, BetStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TeamBadge } from './TeamsView';
import { LeagueBadge } from './LeaguesView';
import Logo from './Logo';

interface CategoryDetailsModalProps {
  title: string;
  icon: string;
  monthlyStake: number;
  bets: Bet[];
  currency: string;
  onClose: () => void;
  type?: 'team' | 'league' | 'tag' | 'methodology';
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({ title, icon, bets, currency, monthlyStake, onClose, type = "methodology" }) => {
  const sortedBets = useMemo(() => [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [bets]);

  const stats = useMemo(() => {
    let profit = 0;
    let invested = 0;
    let won = 0;
    let totalSettled = 0;
    let maxDrawdown = 0;
    let peak = 0;
    let currentBalance = 0;
    
    const winningBets = [];
    const losingBets = [];

    const dailyMap: Record<string, number> = {};
    let currentBalancePct = 0;

    sortedBets.forEach(b => {
      profit += b.profit;
      invested += b.stake;
      currentBalance += b.profit;
      
      const pctProfit = b.stake > 0 ? (b.profit / b.stake) * 100 : 0;
      currentBalancePct += pctProfit;
      
      if (currentBalancePct > peak) peak = currentBalancePct;
      const dd = peak - currentBalancePct;
      if (dd > maxDrawdown) maxDrawdown = dd;

      if (b.status !== BetStatus.PENDING) {
        totalSettled += 1;
        if (b.status === BetStatus.WON) {
            won += 1;
            winningBets.push(pctProfit);
        } else if (b.status === BetStatus.LOST || b.status === BetStatus.HALF_LOST) {
            losingBets.push(pctProfit);
        }
      }

      const d = b.date.split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = 0;
      dailyMap[d] += b.profit;
    });

    const winRate = totalSettled > 0 ? (won / totalSettled) * 100 : 0;
    const roi = invested > 0 ? (profit / invested) * 100 : 0;
    const avgWin = winningBets.length > 0 ? winningBets.reduce((a, b) => a + b, 0) / winningBets.length : 0;
    const avgLoss = losingBets.length > 0 ? losingBets.reduce((a, b) => a + b, 0) / losingBets.length : 0;

    // Equity Curve Data
    const sortedDates = Object.keys(dailyMap).sort();
    let acc = 0;
    const chartData = sortedDates.map(date => {
      acc += dailyMap[date];
      return {
        name: date.split('-').reverse().slice(0,2).join('/'),
        fullDate: date,
        profit: acc
      };
    });
    
    // Add an initial point
    if (chartData.length > 0) {
        chartData.unshift({ name: 'Início', fullDate: '', profit: 0 });
    }

    return { profit, invested, winRate, roi, avgWin, avgLoss, maxDrawdown, chartData, totalSettled };
  }, [sortedBets]);

  const formatCurrency = (val: number) => {
    const sign = val < 0 ? '-' : '';
    return `${sign}${Math.abs(val).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency}`;
  };

  const off = stats.chartData.length > 0 ? (() => {
    const min = Math.min(...stats.chartData.map(d => d.profit));
    const max = Math.max(...stats.chartData.map(d => d.profit));
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  })() : 1;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className={`font-bold ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            P/L Acum: {formatCurrency(val)} {monthlyStake > 0 && <span className="opacity-70 text-sm">({val >= 0 ? '+' : ''}{(val / monthlyStake * 100).toFixed(1)}%)</span>}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Mantém o logotipo visível sobre o fundo sombreado */}
      <div className="fixed top-6 left-6 hidden lg:flex items-center gap-3 z-[110] pointer-events-none">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
      </div>
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {type === 'team' ? (
                <TeamBadge teamName={title} size="sm" editable={false} />
              ) : type === 'league' ? (
                <LeagueBadge leagueName={title} size="sm" editable={false} />
              ) : (
                <i className={`fas ${icon} text-yellow-400`}></i>
              )} {title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Análise detalhada no mês atual</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">P/L Líquido</p>
              <p className={`text-2xl font-bold flex items-end gap-2 ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>{stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}</span>
                {monthlyStake > 0 && (
                  <span className="text-sm opacity-70 mb-1 font-mono">
                    ({stats.profit >= 0 ? '+' : ''}{(stats.profit / monthlyStake * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Yield / ROI</p>
              <p className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.winRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Entradas</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalSettled}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Chart */}
             <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <i className="fas fa-chart-area text-yellow-400"></i> Curva de Crescimento
                </h3>
                <div className="h-[300px] w-full">
                  {stats.chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="splitColorMethod" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor="#10b981" stopOpacity={1} />
                            <stop offset={off} stopColor="#ef4444" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="splitFillMethod" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                            <stop offset={off} stopColor="#10b981" stopOpacity={0.05} />
                            <stop offset={off} stopColor="#ef4444" stopOpacity={0.05} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis 
                           stroke="#475569" 
                           fontSize={10} 
                           tickLine={false} 
                           axisLine={false} 
                           domain={['auto', 'auto']}
                           tickFormatter={(value) => {
                             if (monthlyStake > 0) {
                               const pct = (value / monthlyStake) * 100;
                               return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
                             }
                             return `${value > 0 ? '+' : ''}${value.toFixed(0)}`;
                           }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="url(#splitColorMethod)" 
                          fill="url(#splitFillMethod)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <i className="fas fa-chart-line text-4xl mb-3 opacity-20"></i>
                      <p>Dados insuficientes para gerar gráfico</p>
                    </div>
                  )}
                </div>
             </div>

             {/* Secondary Stats */}
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue-400"></i> Métricas Avançadas
                </h3>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Green</span>
                  <span className="text-emerald-400 font-bold">+{stats.avgWin.toFixed(2)}%</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Red</span>
                  <span className="text-red-400 font-bold">{stats.avgLoss.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Max Drawdown</span>
                  <span className="text-red-400 font-bold">-{stats.maxDrawdown.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">ROI do Método</span>
                  <span className={`font-bold ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
                  </span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsModal;
