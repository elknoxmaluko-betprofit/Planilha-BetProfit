const fs = require('fs');
let content = fs.readFileSync('components/MethodologyDetailsModal.tsx', 'utf8');

content = content.replace(
  '<span className="text-red-400 font-bold">{(-stats.maxDrawdown).toFixed(2)}%</span>',
  '<span className="text-red-400 font-bold">-{stats.maxDrawdown.toFixed(2)}%</span>'
);

content = content.replace(
  '<span className="text-red-400 font-bold">{-stats.maxDrawdown.toFixed(2)}%</span>',
  '<span className="text-red-400 font-bold">-{stats.maxDrawdown.toFixed(2)}%</span>'
);

fs.writeFileSync('components/MethodologyDetailsModal.tsx', content);
