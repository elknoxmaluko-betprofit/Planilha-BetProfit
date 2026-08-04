const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

content = content.replace(
  /best: sortedTeams\.slice\(0, 5\),/,
  'winners: sortedTeams.filter(t => t.profit > 0).slice(0, 5),'
);

content = content.replace(
  /worst: sortedTeams\.slice\(-5\)\.reverse\(\)/,
  'losers: [...sortedTeams].reverse().filter(t => t.profit < 0).slice(0, 5)'
);

fs.writeFileSync('components/Dashboard.tsx', content);
