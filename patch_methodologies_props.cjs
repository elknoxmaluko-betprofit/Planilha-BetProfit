const fs = require('fs');
let content = fs.readFileSync('components/MethodologiesView.tsx', 'utf8');

content = content.replace(
  /interface MethodologiesViewProps \{/,
  'interface MethodologiesViewProps {\n  monthlyStake: number;'
);

content = content.replace(
  /const MethodologiesView: React\.FC<MethodologiesViewProps> = \(\{ bets, available, onCreate, onDelete, onEdit, currency \}\) => \{/,
  'const MethodologiesView: React.FC<MethodologiesViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency, monthlyStake }) => {'
);

// Add monthlyStake to CategoryDetailsModal
content = content.replace(
  /currency=\{currency\}/,
  'currency={currency}\n          monthlyStake={monthlyStake}'
);

// Add percentage to P/L Líquido display in card
content = content.replace(
  /<p className=\{\`font-mono font-bold \$\{item\.profit >= 0 \? 'text-emerald-400' : 'text-red-400'\}\`\}>\n\s*\{item\.profit >= 0 \? '\+' : ''\}\{item\.profit\.toFixed\(2\)\}\{currency\}\n\s*<\/p>/g,
  `<p className={\`font-mono font-bold \${item.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                    {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}{currency}
                    {monthlyStake > 0 && <span className="text-[10px] ml-1 opacity-70">({item.profit >= 0 ? '+' : ''}{(item.profit / monthlyStake * 100).toFixed(0)}%)</span>}
                  </p>`
);

fs.writeFileSync('components/MethodologiesView.tsx', content);
