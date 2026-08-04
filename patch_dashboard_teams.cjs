const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const oldLogic = `  const teamPerformanceData = React.useMemo(() => {
    const teamStats: Record<string, number> = {};
    
    bets.forEach(bet => {
      const parts = bet.event.split(/\\s+(?:vs|v|@|-|(?<!\\d)\\/(?!\\d))\\s+/i);
      const teamsInBet = new Set<string>();
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) teamsInBet.add(trimmed);
      });
      if (bet.team) teamsInBet.add(bet.team);

      teamsInBet.forEach(team => {
        teamStats[team] = (teamStats[team] || 0) + bet.profit;
      });
    });`;

const newLogic = `  const teamPerformanceData = React.useMemo(() => {
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
      best: sortedTeams.slice(0, 5),
      worst: sortedTeams.slice(-5).reverse()
    };
  }, [bets]);`;

content = content.replace(
  /  const teamPerformanceData = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[bets\]\);/,
  newLogic
);

fs.writeFileSync('components/Dashboard.tsx', content);
