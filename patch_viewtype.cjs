const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /useState<'dashboard' \| 'annual' \| 'bets' \| 'add' \| 'markets' \| 'methodologies' \| 'tags' \| 'leagues' \| 'teams' \| 'projects' \| 'data' \| 'ladder'>/,
  "useState<'dashboard' | 'annual' | 'bets' | 'notes' | 'add' | 'markets' | 'methodologies' | 'tags' | 'leagues' | 'teams' | 'projects' | 'data' | 'ladder'>"
);

fs.writeFileSync('App.tsx', content);
