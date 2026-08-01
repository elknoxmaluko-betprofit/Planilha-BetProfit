const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

content = content.replace(
  /icon: string; string;/,
  'icon: string;\n  monthlyStake: number;'
);

content = content.replace(
  /\{ title, icon, bets, currency, onClose \}/,
  '{ title, icon, bets, currency, monthlyStake, onClose }'
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
