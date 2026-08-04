const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /const teamsList = useMemo\(\(\) => \{[\s\S]*?\}, \[bets\]\);/;
const match = content.match(regex);
console.log(match ? match[0] : "Not found");
