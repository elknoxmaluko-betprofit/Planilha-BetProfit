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
  
  // Cálculos Auxiliares
  const { htCount, ftCount, avgWin, avgLoss } = React.useMemo(() => {
    const ht = bets.filter(b => b.market.toUpperCase().includes('FIRST HALF')).length;
    const ft = bets.length - ht;

    const winningBets = bets.filter(b => b.profit > 0);
    const losingBets = bets.filter(b => b.profit < 0);

    const avgWinVal = winningBets.length > 0 
      ? winningBets.reduce((acc, b) => acc + b.profit, 0) / winningBets.length 
      : 0;

    const avgLossVal = losingBets.length > 0 
      ? losingBets.reduce((acc, b) => acc + b.profit, 0) / losingBets.length 
      : 0;

    return { htCount: ht, ftCount: ft, avgWin: avgWinVal, avgLoss: avgLossVal };
  }, [bets]);

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

  const currentBank = stats.monthlyBankroll + stats.totalProfit;

  return (
    <div className="space-y-6">
      
      {/* Secção de Topo - Layout Original Restaurado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Banca Total - Grande à Esquerda */}
        <div className="lg:col-span-2 bg-emerald-950/20 border border-emerald-500/10 p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <i className="fas fa-wallet text-9xl text-emerald-400"></i>
          </div>
          <p className="text-emerald-400 font-black tracking-[0.2em] text-xs uppercase mb-3">Banca Total</p>
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
             <h2 className="text-5xl lg:text-7xl font-black text-white font-mono tracking-tighter">
               {currentBank.toFixed(2)}{currency}
             </h2>
             {stats.totalProfit !== 0 && (
               <span className={`px-4 py-2 rounded-xl font-bold text-sm lg:text-base border ${stats.totalProfit > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                 {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}{currency} P/L
               </span>
             )}
          </div>
        </div>

        {/* Card Lucro em Stakes - Direita */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <i className="fas fa-chart-line text-8xl text-slate-400"></i>
           </div>
           <div>
             <p className="text-slate-500 font-black tracking-[0.2em] text-xs uppercase mb-3">Lucro em Stakes</p>
             <h2 className={`text-5xl font-black font-mono tracking-tighter ${stats.profitInStakes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
               {stats.profitInStakes > 0 ? '+' : ''}{stats.profitInStakes.toFixed(2)}
             </h2>
           </div>
           <div className="mt-6 text-right">
              <p className={`text-xl font-bold ${stats.profitInStakes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.profitInStakes > 0 ? '+' : ''}{(stats.profitInStakes * 100).toFixed(0)}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">% Sobre a Stake</p>
           </div>
        </div>
      </div>

      {/* Linha de Cartões Estatísticos (Agora com Green/Red Médio) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Card 1: Mercados */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
             <i className="fas fa-store"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Mercados</p>
           <h4 className="text-2xl font-black text-white mb-2">{stats.uniqueMarketsCount}</h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             HT {htCount} <span className="text-slate-600">|</span> FT {ftCount}
           </p>
        </div>

        {/* Card 2: Green Médio (NOVO) */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
             <i className="fas fa-arrow-up"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Green Médio</p>
           <h4 className="text-2xl font-black text-emerald-400 mb-2">+{avgWin.toFixed(2)}{currency}</h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             Média por vitória
           </p>
        </div>

        {/* Card 3: Red Médio (NOVO) */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 mb-4">
             <i className="fas fa-arrow-down"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Red Médio</p>
           <h4 className="text-2xl font-black text-red-400 mb-2">{avgLoss.toFixed(2)}{currency}</h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             Média por derrota
           </p>
        </div>

        {/* Card 4: ROI Mensal */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
             <i className="fas fa-percentage"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">ROI Mensal</p>
           <h4 className={`text-2xl font-black ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'} mb-2`}>
             {stats.roi.toFixed(2)}%
           </h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             Retorno sobre banca
           </p>
        </div>

        {/* Card 5: Win Rate */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
             <i className="fas fa-bullseye"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Win Rate</p>
           <h4 className="text-2xl font-black text-white mb-2">{stats.winRate.toFixed(1)}%</h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             Taxa de acerto
           </p>
        </div>

        {/* Card 6: Yield */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[1.5rem] hover:border-slate-700 transition-all">
           <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 mb-4">
             <i className="fas fa-chart-line"></i>
           </div>
           <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Yield</p>
           <h4 className={`text-2xl font-black ${stats.yield >= 0 ? 'text-white' : 'text-red-400'} mb-2`}>
             {stats.yield.toFixed(1)}%
           </h4>
           <p className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-800/50">
             Eficiência
           </p>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Gráfico de Lucro Diário */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-lg">
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
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 flex flex-col shadow-lg">
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
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-lg">
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

// Componentes Auxiliares

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span>
  </div>
);

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string }> = ({ title, data, color, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-md">
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