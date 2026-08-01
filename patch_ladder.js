const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

content = content.replace(
  '{layLiabilityAtOdd > 0 ? formatCurrency(layLiabilityAtOdd) : \'\'}',
  '{formatCurrency(layLiability)}'
);

content = content.replace(
  '{backProfitAtOdd > 0 ? formatCurrency(backProfitAtOdd) : \'\'}',
  '{formatCurrency(backProfit)}'
);

fs.writeFileSync('components/LadderView.tsx', content);
