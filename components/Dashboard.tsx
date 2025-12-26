
import React from 'react';
import { Stats, Bet, BetStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardProps {
  stats: Stats;
  bets: Bet[];
  allBets: Bet[];
  selectedYear: number;
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, bets, allBets, selectedYear, currency }) => {
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
    
    const data = [
      { name: 'Início', balance: stats.monthlyBankroll },
      ...sortedBets.map((bet, index) => {
        runningBank += bet.profit;
        return {
          name: `Aposta ${index + 1}`,
          balance: parseFloat(runningBank.toFixed(2))
        };
      })
    ];
    return data;
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

  return (
    <div className="space-y-6 lg:space-y-10">
      
      {/* Cards de Topo - Compactos em Mobile/Tablet, Grandes em Desktop (lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          title="Total Lucro" 
          value={`${stats.totalProfit > 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}${currency}`} 
          color={stats.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"} 
          icon="fa-coins" 
          subValue={`${stats.roi.toFixed(1)}% ROI`}
          subColor={stats.roi >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard 
          title="Yield" 
          value={`${stats.yield > 0 ? '+' : ''}${stats.yield.toFixed(1)}%`} 
          color={stats.yield >= 0 ? "text-emerald-400" : "text-red-400"} 
          icon="fa-chart-line" 
          subValue={`${stats.profitInStakes.toFixed(1)} Stakes`}
          subColor={stats.profitInStakes >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard 
          title="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`} 
          color="text-blue-400" 
          icon="fa-bullseye" 
          subValue={`${stats.totalBets} Apostas`}
          subColor="text-slate-400"
        />
        <StatCard 
          title="Banca Atual" 
          value={`${(stats.monthlyBankroll + stats.totalProfit).toFixed(2)}${currency}`} 
          color="text-yellow-400" 
          icon="fa-wallet" 
          subValue="Previsão Fim Mês"
          subColor="text-slate-500"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Gráfico de Lucro Diário */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-calendar-day text-yellow-400 text-sm"></i> Performance Diária
            </h3>
          </div>
          <div className="h-[200px] lg:h-[300px]">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.replace('Dia ', '')} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b', opacity: 0.4 }} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} 
                    itemStyle={{ color: '#fff' }} 
                  />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza (Win/Loss) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 flex flex-col shadow-lg">
          <h3 className="text-lg lg:text-xl font-bold text-white mb-4 text-center">Distribuição</h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
             {winLossDetailedData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie 
                    data={winLossDetailedData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value" 
                    stroke="none"
                   >
                     {winLossDetailedData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="text-slate-500 italic text-sm">Sem dados</div>
             )}
             {/* Centro do Donut */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                   <span className="block text-2xl font-black text-white">{stats.totalBets}</span>
                   <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Apostas</span>
                </div>
             </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
             <LegendItem color="#fbbf24" label="HT Ganho" />
             <LegendItem color="#fef3c7" label="HT Perda" />
             <LegendItem color="#10b981" label="FT Ganho" />
             <LegendItem color="#ef4444" label="FT Perda" />
          </div>
        </div>
      </div>

      {/* Curva de Equidade */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
             <i className="fas fa-chart-area text-yellow-400 text-sm"></i> Curva de Crescimento
          </h3>
        </div>
        <div className="h-[200px] lg:h-[300px]">
          {equityData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorBalanceDb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/><stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} 
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="balance" name="Banca" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorBalanceDb)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm">
              Registe mais operações para ver a curva
            </div>
          )}
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <RankingCard title="Melhores Equipas" data={teamPerformanceData.winners} color="#10b981" icon="fa-trophy" />
        <RankingCard title="Piores Equipas" data={teamPerformanceData.losers} color="#ef4444" icon="fa-thumbs-down" />
        <RankingCard title="Melhores Ligas" data={leaguePerformanceData.winners} color="#10b981" icon="fa-medal" />
        <RankingCard title="Piores Ligas" data={leaguePerformanceData.losers} color="#ef4444" icon="fa-exclamation-triangle" />
      </div>
    </div>
  );
};

// Componentes Auxiliares Otimizados

const StatCard: React.FC<{ title: string; value: string; color: string; icon: string; subValue: string; subColor: string }> = ({ title, value, color, icon, subValue, subColor }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] shadow-md hover:border-slate-700 transition-all">
    <div className="flex items-start justify-between mb-2">
      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-800 flex items-center justify-center shadow-inner`}>
        <i className={`fas ${icon} text-lg lg:text-xl ${color}`}></i>
      </div>
      <span className={`text-[10px] lg:text-xs font-black ${subColor} bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/50`}>
        {subValue}
      </span>
    </div>
    <div className="mt-2">
      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{title}</p>
      <h4 className={`text-xl lg:text-3xl font-black font-mono mt-1 truncate ${color}`}>{value}</h4>
    </div>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span>
  </div>
);

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string }> = ({ title, data, color, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 shadow-md">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <i className={`fas ${icon}`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[200px] lg:h-[250px]">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Sem dados</div>
      )}
    </div>
  </div>
);

export default Dashboard;
