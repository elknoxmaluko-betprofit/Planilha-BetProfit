import React from 'react';
import { Bet, BetStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface AnnualViewProps {
  bets: Bet[];
  selectedYear: number;
  monthlyBankrolls: Record<string, number>;
  monthlyStakes: Record<string, number>;
  currency: string;
}

const AnnualView: React.FC<AnnualViewProps> = ({ bets, selectedYear, monthlyBankrolls, monthlyStakes, currency }) => {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const { annualStats, htCount, ftCount, totalGains, totalLosses, avgWin, avgLoss, avgWinPct, avgLossPct } = React.useMemo(() => {
    const settled = bets.filter(b => b.status !== BetStatus.PENDING);
    const totalProfit = settled.reduce((acc, b) => acc + b.profit, 0);
    const totalInvested = settled.reduce((acc, b) => acc + b.stake, 0);
    const won = settled.filter(b => b.status === BetStatus.WON).length;
    
    // Ganhos e Perdas brutos
    const gains = settled.filter(b => b.profit > 0).reduce((acc, b) => acc + b.profit, 0);
    const losses = settled.filter(b => b.profit < 0).reduce((acc, b) => acc + Math.abs(b.profit), 0);
    
    // Médias
    const winningBets = settled.filter(b => b.profit > 0);
    const losingBets = settled.filter(b => b.profit < 0);
    const avgWinVal = winningBets.length > 0 ? gains / winningBets.length : 0;
    const avgLossVal = losingBets.length > 0 ? (losses * -1) / losingBets.length : 0;

    // Percentagens médias (ROI por aposta)
    const avgWinPctVal = winningBets.length > 0
      ? winningBets.reduce((acc, b) => acc + ((b.stake > 0 ? b.profit / b.stake : 0) * 100), 0) / winningBets.length
      : 0;

    const avgLossPctVal = losingBets.length > 0
      ? losingBets.reduce((acc, b) => acc + ((b.stake > 0 ? b.profit / b.stake : 0) * 100), 0) / losingBets.length
      : 0;

    // Contagem HT / FT para o ano
    const ht = bets.filter(b => b.market.toUpperCase().includes('FIRST HALF')).length;
    const ft = bets.length - ht;
    
    // Calcula média de lucro em stakes baseada nos stakes mensais válidos
    let sumProfitInStakes = 0;
    
    for (let i = 0; i < 12; i++) {
      const monthKey = `${selectedYear}-${i}`;
      const monthStake = monthlyStakes[monthKey] || 0;
      const monthBets = bets.filter(b => new Date(b.date).getMonth() === i);
      const monthProfit = monthBets.reduce((acc, b) => acc + b.profit, 0);
      
      if (monthStake > 0) {
        sumProfitInStakes += monthProfit / monthStake;
      }
    }

    return {
      annualStats: {
        totalBets: bets.length,
        winRate: settled.length > 0 ? (won / settled.length) * 100 : 0,
        totalProfit,
        yield: totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0,
        profitInStakes: sumProfitInStakes,
        marketsCount: bets.length 
      },
      htCount: ht,
      ftCount: ft,
      totalGains: gains,
      totalLosses: losses,
      avgWin: avgWinVal,
      avgLoss: avgLossVal,
      avgWinPct: avgWinPctVal,
      avgLossPct: avgLossPctVal
    };
  }, [bets, selectedYear, monthlyStakes]);

  const monthlyData = React.useMemo(() => {
    return months.map((name, index) => {
      const monthBets = bets.filter(b => new Date(b.date).getMonth() === index);
      const profit = monthBets.reduce((acc, b) => acc + b.profit, 0);
      return {
        name,
        profit: parseFloat(profit.toFixed(2))
      };
    });
  }, [bets]);

  const annualEquityData = React.useMemo(() => {
    if (bets.length === 0) return [];
    const sortedBets = [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningProfit = 0;
    
    const data = [
      { name: 'Início', balance: 0 }
    ];

    sortedBets.forEach((bet, index) => {
      runningProfit += bet.profit;
      data.push({
        name: `Aposta ${index + 1}`,
        balance: parseFloat(runningProfit.toFixed(2))
      });
    });

    return data;
  }, [bets]);

  const winLossDetailedData = React.useMemo(() => {
    const settled = bets.filter(b => b.status !== BetStatus.PENDING);
    const htWins = settled.filter(b => b.market.toUpperCase().includes('FIRST HALF') && b.status === BetStatus.WON).length;
    const htLosses = settled.filter(b => b.market.toUpperCase().includes('FIRST HALF') && b.status === BetStatus.LOST).length;
    const ftWins = settled.filter(b => !b.market.toUpperCase().includes('FIRST HALF') && b.status === BetStatus.WON).length;
    const ftLosses = settled.filter(b => !b.market.toUpperCase().includes('FIRST HALF') && b.status === BetStatus.LOST).length;

    return [
      { name: 'HT Ganhos', value: htWins, color: '#fbbf24' },
      { name: 'HT Perdas', value: htLosses, color: '#fef3c7' },
      { name: 'FT Ganhos', value: ftWins, color: '#10b981' },
      { name: 'FT Perdas', value: ftLosses, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [bets]);

  const teamPerformanceData = React.useMemo(() => {
    const teamStats: Record<string, number> = {};
    
    bets.forEach(bet => {
      const parts = bet.event.split(/\s+(?:vs|v|@|-|(?<!\d)\/(?!\d))\s+/i);
      const teamsInBet = new Set<string>();
      
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) teamsInBet.add(trimmed);
      });
      
      if (bet.team) teamsInBet.add(bet.team);

      teamsInBet.forEach(team => {
        teamStats[team] = (teamStats[team] || 0) + bet.profit;
      });
    });

    const sorted = Object.entries(teamStats)
      .map(([name, profit]) => ({ name, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit);

    return { 
      winners: sorted.filter(t => t.profit > 0).slice(0, 5),
      losers: [...sorted].reverse().filter(t => t.profit < 0).slice(0, 5)
    };
  }, [bets]);

  const leaguePerformanceData = React.useMemo(() => {
    const leagueStats: Record<string, number> = {};
    bets.forEach(bet => {
      const league = bet.league || 'Outros';
      leagueStats[league] = (leagueStats[league] || 0) + bet.profit;
    });
    const sorted = Object.entries(leagueStats)
      .map(([name, profit]) => ({ name, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit);
    return {
      winners: sorted.filter(l => l.profit > 0).slice(0, 5),
      losers: [...sorted].reverse().filter(l => l.profit < 0).slice(0, 5)
    };
  }, [bets]);

  // Logic for Dynamic Chart Styling
  const gradientOffset = () => {
    if (annualEquityData.length === 0) return 0;
    const dataMax = Math.max(...annualEquityData.map((i) => i.balance));
    const dataMin = Math.min(...annualEquityData.map((i) => i.balance));
  
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
  
    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* Cards de Resumo Anual - Compactos em Mobile, Amplos em Desktop */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <div className="flex-1 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/20 p-5 lg:p-10 rounded-3xl lg:rounded-[3rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700"></div>
          <p className="text-yellow-400 text-[10px] lg:text-sm font-black uppercase tracking-[0.25em] mb-2 lg:mb-3">Lucro Anual Total</p>
          <div className="flex items-baseline gap-2 lg:gap-4 flex-wrap">
            <h3 className="text-3xl lg:text-6xl font-black text-white font-mono">{annualStats.totalProfit.toFixed(2)}{currency}</h3>
            <span className={`text-xs lg:text-lg font-black px-2 lg:px-4 py-1 lg:py-1.5 rounded-xl lg:rounded-2xl border ${annualStats.yield >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {annualStats.yield.toFixed(1)}% Yield
            </span>
          </div>
        </div>

        <div className="lg:w-1/3 bg-slate-900 border border-slate-800 p-5 lg:p-10 rounded-3xl lg:rounded-[3rem] flex flex-col justify-center group hover:border-yellow-500/30 transition-all shadow-lg">
          <p className="text-slate-500 text-[10px] lg:text-sm font-black uppercase tracking-[0.25em] mb-2 lg:mb-3">Total Stakes Anuais</p>
          <div className="flex items-center gap-6">
            <h3 className={`text-3xl lg:text-6xl font-black font-mono ${annualStats.profitInStakes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {annualStats.profitInStakes >= 0 ? '+' : ''}{annualStats.profitInStakes.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        <StatCard 
          title="Mercados" 
          value={`${annualStats.marketsCount}`} 
          icon="fa-shop" 
          color="text-purple-400" 
          subtitle={`HT ${htCount} | FT ${ftCount}`} 
        />
        <StatCard 
          title="Green Médio" 
          value={`+${avgWinPct.toFixed(2)}%`} 
          icon="fa-arrow-up" 
          color="text-emerald-400" 
          subtitle="Média por vitória" 
        />
        <StatCard 
          title="Red Médio" 
          value={`${avgLossPct.toFixed(2)}%`} 
          icon="fa-arrow-down" 
          color="text-red-400" 
          subtitle="Média por derrota" 
        />
        <StatCard title="Win Rate" value={`${annualStats.winRate.toFixed(1)}%`} icon="fa-bullseye" color="text-blue-400" subtitle="Taxa de acerto anual" />
        <StatCard 
          title="Total Volume" 
          value={`${bets.reduce((acc, b) => acc + b.stake, 0).toFixed(0)}${currency}`} 
          icon="fa-coins" 
          color="text-yellow-400" 
          subtitle={`G: ${totalGains.toFixed(0)} | P: ${totalLosses.toFixed(0)}`} 
        />
        <StatCard title="Yield Médio" value={`${annualStats.yield.toFixed(1)}%`} icon="fa-chart-line" color="text-emerald-400" subtitle="Eficiência global" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-6 lg:mb-8">Performance Mensal ({currency})</h3>
          <div className="h-[200px] lg:h-[350px]">
            {bets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm">Sem atividade registada este ano</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 flex flex-col">
          <h3 className="text-lg lg:text-xl font-bold mb-6 lg:mb-8 text-white text-center">Distribuição HT / FT (Anual)</h3>
          <div className="h-[200px] lg:h-[280px] flex items-center justify-center">
            {winLossDetailedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winLossDetailedData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                    {winLossDetailedData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="text-slate-500 text-sm italic text-center">Aguardando dados anuais</div>
            )}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <LegendItem color="#fbbf24" label="HT Ganho" />
            <LegendItem color="#fef3c7" label="HT Perda" />
            <LegendItem color="#10b981" label="FT Ganho" />
            <LegendItem color="#ef4444" label="FT Perda" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
           <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
             <i className="fas fa-chart-area text-yellow-400 text-sm"></i> Curva de Crescimento Anual
           </h3>
        </div>
        <div className="h-[200px] lg:h-[350px]">
          {annualEquityData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={annualEquityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="splitColorAnnual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor="#34d399" stopOpacity={1} />
                    <stop offset={off} stopColor="#f87171" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="splitFillAnnual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset={off} stopColor="#f87171" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis 
                   stroke="#64748b" 
                   fontSize={11} 
                   fontWeight="bold"
                   tickLine={false} 
                   axisLine={false} 
                   domain={['auto', 'auto']}
                   tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: `1px solid ${annualStats.totalProfit >= 0 ? '#34d39940' : '#f8717140'}`, borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }} 
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}${currency}`, 'Lucro Acumulado']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="url(#splitColorAnnual)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#splitFillAnnual)"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isPositive = payload.balance >= 0;
                    return (
                      <circle cx={cx} cy={cy} r={4} stroke={isPositive ? "#34d399" : "#f87171"} strokeWidth={2} fill="#0f172a" />
                    );
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isPositive = payload.balance >= 0;
                    return (
                      <circle cx={cx} cy={cy} r={6} stroke="#fff" strokeWidth={2} fill={isPositive ? "#34d399" : "#f87171"} />
                    );
                  }}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm">Registe mais operações para ver a curva anual</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <RankingCard title="Top 5 Equipas Lucrativas (Ano)" data={teamPerformanceData.winners} color="#10b981" icon="fa-trophy" />
        <RankingCard title="Top 5 Equipas com Prejuízo (Ano)" data={teamPerformanceData.losers} color="#ef4444" icon="fa-arrow-trend-down" />
        <RankingCard title="Top 5 Campeonatos Lucrativos (Ano)" data={leaguePerformanceData.winners} color="#10b981" icon="fa-medal" />
        <RankingCard title="Top 5 Campeonatos com Prejuízo (Ano)" data={leaguePerformanceData.losers} color="#ef4444" icon="fa-triangle-exclamation" />
      </div>
    </div>
  );
};

// Componentes Auxiliares Otimizados

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; subtitle?: string }> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 lg:p-8 rounded-2xl lg:rounded-[2rem] transition-all hover:border-slate-700 shadow-lg flex flex-col justify-between group">
    <div>
      <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-800 flex items-center justify-center ${color} mb-3 lg:mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon} text-lg lg:text-2xl`}></i>
      </div>
      <p className="text-slate-500 text-[10px] lg:text-xs mb-1 lg:mb-1.5 uppercase tracking-widest font-black leading-tight">{title}</p>
      <h4 className="text-xl lg:text-2xl font-black text-white font-mono break-words">{value}</h4>
    </div>
    {subtitle && (
      <p className="text-[10px] lg:text-xs text-slate-400 font-bold mt-3 lg:mt-4 border-t border-slate-800 pt-3 lg:pt-4 uppercase tracking-wider">{subtitle}</p>
    )}
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2 lg:gap-3">
    <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-md shadow-sm" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-tighter">{label}</span>
  </div>
);

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string }> = ({ title, data, color, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-md">
    <h3 className="text-lg lg:text-xl font-bold text-white mb-6 lg:mb-8 flex items-center gap-3">
      <i className={`fas ${icon}`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[200px] lg:h-[280px]">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#fff" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={[0, 6, 6, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Sem dados registrados</div>
      )}
    </div>
  </div>
);

export default AnnualView;