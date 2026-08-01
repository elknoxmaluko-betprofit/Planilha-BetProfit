const fs = require('fs');

function patchFile(file, isTeams) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /interface (TagsViewProps|LeaguesViewProps|TeamsViewProps) \{/,
    'interface $1 {\n  monthlyStake: number;'
  );

  if (isTeams) {
    content = content.replace(
      /const TeamsView: React\.FC<TeamsViewProps> = \(\{ bets, availableTeams, currency \}\) => \{/,
      'const TeamsView: React.FC<TeamsViewProps> = ({ bets, availableTeams, currency, monthlyStake }) => {'
    );
  } else if (file.includes('Tags')) {
    content = content.replace(
      /const TagsView: React\.FC<TagsViewProps> = \(\{ bets, available, onCreate, onDelete, onEdit, currency \}\) => \{/,
      'const TagsView: React.FC<TagsViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency, monthlyStake }) => {'
    );
  } else if (file.includes('Leagues')) {
    content = content.replace(
      /const LeaguesView: React\.FC<LeaguesViewProps> = \(\{ bets, available, onCreate, onDelete, onEdit, currency \}\) => \{/,
      'const LeaguesView: React.FC<LeaguesViewProps> = ({ bets, available, onCreate, onDelete, onEdit, currency, monthlyStake }) => {'
    );
  }

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

  fs.writeFileSync(file, content);
}

patchFile('components/TagsView.tsx', false);
patchFile('components/LeaguesView.tsx', false);
patchFile('components/TeamsView.tsx', true);

