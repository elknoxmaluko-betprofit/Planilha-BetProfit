const fs = require('fs');
let modalContent = fs.readFileSync('components/MethodologyDetailsModal.tsx', 'utf8');

modalContent = modalContent.replace(/MethodologyDetailsModal/g, 'CategoryDetailsModal');
modalContent = modalContent.replace(/methodology:/, 'title: string;\n  icon: string;');
modalContent = modalContent.replace(/\{ methodology, bets, currency, onClose \}/, '{ title, icon, bets, currency, onClose }');

// Change methodBets to sortedBets
modalContent = modalContent.replace(
  /const methodBets = useMemo\(\(\) => bets\.filter\(b => \(b\.methodology \|\| 'Sem Método'\) === methodology\)\.sort\(\(a, b\) => new Date\(a\.date\)\.getTime\(\) - new Date\(b\.date\)\.getTime\(\)\), \[bets, methodology\]\);/,
  `const sortedBets = useMemo(() => [...bets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [bets]);`
);
modalContent = modalContent.replace(/methodBets/g, 'sortedBets');

// Change the title rendering
modalContent = modalContent.replace(
  /<i className="fas fa-flask text-yellow-400"><\/i> \{methodology\}/,
  `<i className={\`fas \${icon} text-yellow-400\`}></i> {title}`
);

// Change the subtitle
modalContent = modalContent.replace(
  /<p className="text-slate-400 text-sm mt-1">Análise detalhada do método no mês atual<\/p>/,
  `<p className="text-slate-400 text-sm mt-1">Análise detalhada no mês atual</p>`
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', modalContent);
fs.unlinkSync('components/MethodologyDetailsModal.tsx');

