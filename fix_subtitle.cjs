const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

// Remove from CustomTooltip
content = content.replace(
  /        const monthNames = \['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'\];\n  let subtitle = "Análise detalhada";\n  if \(bets\.length > 0\) \{\n    const d = new Date\(bets\[0\]\.date\);\n    subtitle = `Análise detalhada em \$\{monthNames\[d\.getMonth\(\)\]\} de \$\{d\.getFullYear\(\)\}`;\n  \}\n  \n  return \(/,
  '      return ('
);

// Insert at the beginning of the component
content = content.replace(
  /const sortedBets = useMemo\(\(\) => \[\.\.\.bets\]\.sort\(\(a, b\) => new Date\(a\.date\)\.getTime\(\) - new Date\(b\.date\)\.getTime\(\)\), \[bets\]\);/,
  `const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let subtitle = "Análise detalhada";
  if (bets.length > 0) {
    const d = new Date(bets[0].date);
    subtitle = \`Análise detalhada em \${monthNames[d.getMonth()]} de \${d.getFullYear()}\`;
  }
  
  const sortedBets = useMemo(() => [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [bets]);`
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
