const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

content = content.replace(
  /const winningBets = \[\];\n\s*const losingBets = \[\];/,
  'const winningBets: number[] = [];\n    const losingBets: number[] = [];'
);

content = content.replace(
  /\|\| b\.status === BetStatus\.HALF_LOST/g,
  ''
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
