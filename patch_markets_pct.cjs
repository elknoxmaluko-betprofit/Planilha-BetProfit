const fs = require('fs');
let content = fs.readFileSync('components/MarketsView.tsx', 'utf8');

// HT Profit
content = content.replace(
  /\{htProfit >= 0 \? '\+' : ''\}\{htProfit\.toFixed\(2\)\}\{currency\}/,
  '{monthlyStake > 0 ? (htProfit >= 0 ? "+" : "") + (htProfit / monthlyStake * 100).toFixed(2) + "%" : "0.00%"}'
);

// FT Profit
content = content.replace(
  /\{ftProfit >= 0 \? '\+' : ''\}\{ftProfit\.toFixed\(2\)\}\{currency\}/,
  '{monthlyStake > 0 ? (ftProfit >= 0 ? "+" : "") + (ftProfit / monthlyStake * 100).toFixed(2) + "%" : "0.00%"}'
);

// Market Profit (P/L Líquido)
content = content.replace(
  /\{market\.profit >= 0 \? '\+' : ''\}\{market\.profit\.toFixed\(2\)\}\{currency\}\n\s*\{monthlyStake > 0 && <span className="text-\[10px\] ml-1 opacity-70">\(\{market\.profit >= 0 \? '\+' : ''\}\{\(market\.profit \/ monthlyStake \* 100\)\.toFixed\(0\)\}%\)<\/span>\}/,
  '{monthlyStake > 0 ? (market.profit >= 0 ? "+" : "") + (market.profit / monthlyStake * 100).toFixed(2) + "%" : "0.00%"}'
);

fs.writeFileSync('components/MarketsView.tsx', content);
