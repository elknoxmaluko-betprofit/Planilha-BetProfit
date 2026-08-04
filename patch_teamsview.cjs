const fs = require('fs');
let content = fs.readFileSync('components/TeamsView.tsx', 'utf8');

content = content.replace(
  /const isSelectedTeam = bet\.team === teamName;/,
  'const isSelectedTeam = bet.team?.trim().toLowerCase() === teamName.toLowerCase();'
);

fs.writeFileSync('components/TeamsView.tsx', content);
