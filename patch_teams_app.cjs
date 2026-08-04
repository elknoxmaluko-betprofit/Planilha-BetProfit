const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const newTeamsList = `const teamsList = useMemo(() => {
    const teamsMap = new Map<string, string>();
    bets.forEach(bet => {
      const parts = bet.event.split(/\\s+(?:vs|v|@|-|(?<!\\d)\\/(?!\\d))\\s+/i);
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed && trimmed.length > 1) {
          const lower = trimmed.toLowerCase();
          if (!teamsMap.has(lower)) {
            teamsMap.set(lower, trimmed);
          }
        }
      });
      if (bet.team) {
        const lowerTeam = bet.team.trim().toLowerCase();
        if (!teamsMap.has(lowerTeam)) {
            teamsMap.set(lowerTeam, bet.team.trim());
        }
      }
    });
    return Array.from(teamsMap.values()).sort();
  }, [bets]);`;

content = content.replace(
  /const teamsList = useMemo\(\(\) => \{[\s\S]*?\}, \[bets\]\);/,
  newTeamsList
);

fs.writeFileSync('App.tsx', content);
