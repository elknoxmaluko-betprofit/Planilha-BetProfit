import React from 'react';
import { Stats, Bet, BetStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardProps {
  stats: Stats;
  bets: Bet[];
  allBets: Bet[];
  selectedYear: number;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, bets, allBets, selectedYear }) => {
  const dailyData = React.useMemo(() => {
    if (bets.length === 0) return [];
    const sortedBets = [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const betsByDay: Record<number, number> = {};
    sortedBets.forEach(bet => {
      const day = new Date(bet.date).getDate();
      betsByDay[day] = (betsByDay[day] || 0) + bet.profit;
    });
    const days = Object.keys(betsByDay).map(Number).sort((a, b) => a - b);
    return days.map(day => ({
      name: `Dia ${day}`,
      profit: parseFloat(betsByDay[day].toFixed(2))
    }));
  }, [bets]);

  const equityData = React.useMemo(() => {
    if (bets.length === 0) return [];
    const sortedBets = [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBank = stats.monthlyBankroll;
    
    return [
      { name: 'Início', balance: stats.monthlyBankroll },
      ...sortedBets.map((bet, index) => {
        runningBank += bet.profit;
        return {
          name: `Aposta ${index + 1}`,
          balance: parseFloat(runningBank.toFixed(2))
        };
      })
    ];
  }, [bets, stats.monthlyBankroll]);

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

    const sortedTeams = Object.entries(teamStats)
      .map(([name, profit]) => ({ name, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit);

    const winners = sortedTeams.filter(t => t.profit > 0).slice(0, 5);
    const losers = [...sortedTeams].reverse().filter(t => t.profit < 0).slice(0, 5);

    return { winners, losers };
  }, [bets]);

  const leaguePerformanceData = React.useMemo(() => {
    const leagueStats: Record<string, number> = {};
    
    bets.forEach(bet => {
      const league = bet.league || 'Outros';
      leagueStats[league] = (leagueStats[league] || 0) + bet.profit;
    });

    const sortedLeagues = Object.entries(leagueStats)
      .map(([name, profit]) => ({ name, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit);

    const winners = sortedLeagues.filter(l => l.profit > 0).slice(0, 5);
    const losers = [...sortedLeagues].reverse().filter(l => l.profit < 0).slice(0, 5);

    return { winners, losers };
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

  const currentTotalBankroll = stats.monthlyBankroll + stats.totalProfit;
  const profitPercentageVsStake = (stats.profitInStakes * 100).toFixed(0);

  const htCount = React.useMemo(() => {
    return bets.filter(b => b.market.toUpperCase().includes('FIRST HALF')).length;
  }, [bets]);

  const ftCount = React.useMemo(() => {
    return bets.length - htCount;
  }, [bets, htCount]);

  return (
    <div className="space-y-10">
      {/* Balões de Banca e Stake */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <p className="text-emerald-400 text-sm font-black uppercase tracking-[0.25em] mb-3">Banca Total</p>
          <div className="flex items-baseline gap-4">
            <h3 className="text-6xl font-black text-white font-mono">{currentTotalBankroll.toFixed(2)}€</h3>
            <span className={`text-lg font-black px-4 py-1.5 rounded-2xl border ${stats.totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}€ P/L
            </span>
          </div>
        </div>

        <div className="lg:w-1/3 bg-slate-900 border border-slate-800 p-10 rounded-[3rem] flex flex-col justify-center group hover:border-emerald-500/30 transition-all shadow-lg">
          <p className="text-slate-500 text-sm font-black uppercase tracking-[0.25em] mb-3">Lucro em Stakes</p>
          <div className="flex items-center justify-between gap-6">
            <h3 className={`text-6xl font-black font-mono ${stats.profitInStakes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.profitInStakes >= 0 ? '+' : ''}{stats.profitInStakes.toFixed(2)}
            </h3>
            <div className="text-right">
              <p className={`text-3xl font-black font-mono ${stats.profitInStakes >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                {stats.profitInStakes >= 0 ? '+' : ''}{profitPercentageVsStake}%
              </p>
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest leading-none mt-1">Crescimento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Mercados" value={`${stats.uniqueMarketsCount}`} icon="fa-shop" color="text-purple-400" subtitle={`HT ${htCount} | FT ${ftCount}`} />
        <StatCard title="ROI Mensal" value={`${stats.roi.toFixed(2)}%`} icon="fa-percentage" color={stats.roi >= 0 ? "text-emerald-400" : "text-red-400"} subtitle="Retorno sobre banca" />
        <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon="fa-bullseye" color="text-blue-400" subtitle="Taxa de acerto" />
        <StatCard title="Yield" value={`${stats.yield.toFixed(1)}%`} icon="fa-chart-line" color="text-yellow-400" subtitle="Eficiência" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-bold text-white mb-8">Resultados Diários (€)</h3>
          <div className="h-[350px]">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '14px' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                    {dailyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-base">Sem atividade registada</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col">
          <h3 className="text-xl font-bold mb-8 text-white text-center">Distribuição HT / FT</h3>
          <div className="h-[280px] flex items-center justify-center">
            {winLossDetailedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winLossDetailedData} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                    {winLossDetailedData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '14px' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="text-slate-500 text-base italic text-center">Aguardando dados</div>
            )}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <LegendItem color="#fbbf24" label="HT Ganho" />
            <LegendItem color="#fef3c7" label="HT Perda" />
            <LegendItem color="#10b981" label="FT Ganho" />
            <LegendItem color="#ef4444" label="FT Perda" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-white">Evolução da Banca</h3>
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Saldo Mensal</span>
        </div>
        <div className="h-[350px]">
          {equityData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '14px' }} labelStyle={{ color: '#94a3b8', marginBottom: '4px' }} />
                <Area type="monotone" dataKey="balance" name="Saldo" stroke="#fbbf24" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-base">Sem dados suficientes para a curva</div>
          )}
        </div>
      </div>

      {/* Rankings de Equipas e Campeonatos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RankingCard title="Top 5 Equipas Lucrativas" data={teamPerformanceData.winners} color="#10b981" icon="fa-trophy" />
        <RankingCard title="Top 5 Equipas com Prejuízo" data={teamPerformanceData.losers} color="#ef4444" icon="fa-arrow-trend-down" />
        <RankingCard title="Top 5 Campeonatos Lucrativos" data={leaguePerformanceData.winners} color="#10b981" icon="fa-medal" />
        <RankingCard title="Top 5 Campeonatos com Prejuízo" data={leaguePerformanceData.losers} color="#ef4444" icon="fa-triangle-exclamation" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; subtitle?: string }> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] transition-all hover:border-slate-700 shadow-lg flex flex-col justify-between group">
    <div>
      <div className={`w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center ${color} mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <p className="text-slate-500 text-xs mb-1.5 uppercase tracking-widest font-black leading-tight">{title}</p>
      <h4 className="text-2xl font-black text-white font-mono break-words">{value}</h4>
    </div>
    {subtitle && (
      <p className="text-xs text-slate-400 font-bold mt-4 border-t border-slate-800 pt-4 uppercase tracking-wider">{subtitle}</p>
    )}
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: color }}></div>
    <span className="text-xs text-slate-400 font-black uppercase tracking-tighter">{label}</span>
  </div>
);

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string }> = ({ title, data, color, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-md">
    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
      <i className={`fas ${icon}`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[280px]">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#fff" fontSize={13} fontWeight="bold" tickLine={false} axisLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={[0, 6, 6, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-base">Sem dados registados</div>
      )}
    </div>
  </div>
);

export default Dashboard;