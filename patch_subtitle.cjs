const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

// Insert the logic before return (
const insertionPoint = 'return (';
const subtitleLogic = `  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let subtitle = "Análise detalhada";
  if (bets.length > 0) {
    const d = new Date(bets[0].date);
    subtitle = \`Análise detalhada em \${monthNames[d.getMonth()]} de \${d.getFullYear()}\`;
  }
  
  `;

content = content.replace(insertionPoint, subtitleLogic + insertionPoint);

// Replace the text
content = content.replace(
  /<p className="text-slate-400 text-sm mt-1">Análise detalhada no mês atual<\/p>/,
  '<p className="text-slate-400 text-sm mt-1">{subtitle}</p>'
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
