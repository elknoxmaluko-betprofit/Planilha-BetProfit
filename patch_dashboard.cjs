const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const teamPerformanceMatch = `  const teamPerformanceData = React.useMemo(() => {
    const teamStats: Record<string, { profit: number, display: string }> = {};
    
    bets.forEach(bet => {
      const parts = bet.event.split(/\\s+(?:vs|v|@|-|(?<!\\d)\\/(?!\\d))\\s+/i);
      const teamsInBet = new Map<string, string>();
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) teamsInBet.set(trimmed.toLowerCase(), trimmed);
      });
      if (bet.team) teamsInBet.set(bet.team.trim().toLowerCase(), bet.team.trim());

      teamsInBet.forEach((display, lower) => {
        if (!teamStats[lower]) teamStats[lower] = { profit: 0, display };
        teamStats[lower].profit += bet.profit;
      });
    });

    const sortedTeams = Object.values(teamStats)
      .map(({ display, profit }) => ({ name: display, profit: parseFloat(profit.toFixed(2)) }))
      .sort((a, b) => b.profit - a.profit);

    return {
      winners: sortedTeams.filter(t => t.profit > 0).slice(0, 5),
      losers: [...sortedTeams].reverse().filter(t => t.profit < 0).slice(0, 5)
    };
  }, [bets]);`;

const teamPerformanceReplace = `  const teamPerformanceData = React.useMemo(() => {
    const teamStats: Record<string, { profit: number, invested: number, display: string }> = {};
    
    bets.forEach(bet => {
      if (bet.status === BetStatus.PENDING) return;
      const parts = bet.event.split(/\\s+(?:vs|v|@|-|(?<!\\d)\\/(?!\\d))\\s+/i);
      const teamsInBet = new Map<string, string>();
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) teamsInBet.set(trimmed.toLowerCase(), trimmed);
      });
      if (bet.team) teamsInBet.set(bet.team.trim().toLowerCase(), bet.team.trim());

      teamsInBet.forEach((display, lower) => {
        if (!teamStats[lower]) teamStats[lower] = { profit: 0, invested: 0, display };
        teamStats[lower].profit += bet.profit;
        teamStats[lower].invested += bet.stake;
      });
    });

    const sortedTeams = Object.values(teamStats)
      .map(({ display, profit, invested }) => {
        const yieldPercent = invested > 0 ? (profit / invested) * 100 : 0;
        return { name: display, profit: parseFloat(yieldPercent.toFixed(2)), rawProfit: profit };
      })
      .sort((a, b) => b.profit - a.profit);

    return {
      winners: sortedTeams.filter(t => t.rawProfit > 0).sort((a, b) => b.profit - a.profit).slice(0, 5),
      losers: sortedTeams.filter(t => t.rawProfit < 0).sort((a, b) => a.profit - b.profit).slice(0, 5)
    };
  }, [bets]);`;

content = content.replace(teamPerformanceMatch, teamPerformanceReplace);

const leaguePerformanceMatch = `  const leaguePerformanceData = React.useMemo(() => {
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
  }, [bets]);`;

const leaguePerformanceReplace = `  const leaguePerformanceData = React.useMemo(() => {
    const leagueStats: Record<string, { profit: number, invested: number }> = {};
    
    bets.forEach(bet => {
      if (bet.status === BetStatus.PENDING) return;
      const league = bet.league || 'Outros';
      if (!leagueStats[league]) leagueStats[league] = { profit: 0, invested: 0 };
      leagueStats[league].profit += bet.profit;
      leagueStats[league].invested += bet.stake;
    });

    const sortedLeagues = Object.entries(leagueStats)
      .map(([name, stats]) => {
        const yieldPercent = stats.invested > 0 ? (stats.profit / stats.invested) * 100 : 0;
        return { name, profit: parseFloat(yieldPercent.toFixed(2)), rawProfit: stats.profit };
      })
      .sort((a, b) => b.profit - a.profit);

    const winners = sortedLeagues.filter(l => l.rawProfit > 0).sort((a, b) => b.profit - a.profit).slice(0, 5);
    const losers = sortedLeagues.filter(l => l.rawProfit < 0).sort((a, b) => a.profit - b.profit).slice(0, 5);

    return { winners, losers };
  }, [bets]);`;

content = content.replace(leaguePerformanceMatch, leaguePerformanceReplace);

// Also need to modify the RankingCard tooltip
const rankingCardMatch = `const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string; alignRight?: boolean }> = ({ title, data, color, icon, alignRight }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-md">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <i className={\`fas \${icon}\`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[200px] lg:h-[250px]">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: alignRight ? 20 : 0, right: alignRight ? 0 : 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} width={80} orientation={alignRight ? 'right' : 'left'} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={alignRight ? [4, 0, 0, 4] : [0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Sem dados</div>
      )}
    </div>
  </div>
);`;

const rankingCardReplace = `
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-lg">
        <p className="text-slate-200 font-bold mb-1">{label}</p>
        <p className="text-emerald-400 font-mono text-sm">Yield: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const RankingCard: React.FC<{ title: string; data: any[]; color: string; icon: string; alignRight?: boolean }> = ({ title, data, color, icon, alignRight }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-5 lg:p-8 shadow-md">
    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <i className={\`fas \${icon}\`} style={{ color }}></i> {title}
    </h3>
    <div className="h-[200px] lg:h-[250px]">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: alignRight ? 20 : 0, right: alignRight ? 0 : 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} width={80} orientation={alignRight ? 'right' : 'left'} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.2 }} />
            <Bar dataKey="profit" fill={color} radius={alignRight ? [4, 0, 0, 4] : [0, 4, 4, 0]} barSize={16}>
               <LabelList dataKey="profit" position={alignRight ? 'left' : 'right'} formatter={(val: number) => \`\${val}%\`} fill="#94a3b8" fontSize={10} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">Sem dados</div>
      )}
    </div>
  </div>
);`;

content = content.replace(rankingCardMatch, rankingCardReplace);

// Need to import LabelList from recharts
content = content.replace(
  "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';",
  "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Area, AreaChart, PieChart, Pie, Cell, LabelList } from 'recharts';"
);

fs.writeFileSync('components/Dashboard.tsx', content);
