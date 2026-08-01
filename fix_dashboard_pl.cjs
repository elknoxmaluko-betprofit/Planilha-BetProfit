const fs = require('fs');
let content = fs.readFileSync('components/Dashboard.tsx', 'utf8');

const oldPL = \`{stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}{currency} P/L\`;
const newPL = \`{stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}{currency} ({stats.totalProfit > 0 ? '+' : ''}{(stats.monthlyStake > 0 ? (stats.totalProfit / stats.monthlyStake) * 100 : 0).toFixed(2)}%) P/L\`;

content = content.replace(oldPL, newPL);
fs.writeFileSync('components/Dashboard.tsx', content);
