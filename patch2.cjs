const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

content = content.replace(
  'const sign = val < 0 ? \'-\' : \'\';\n    return `${sign}${currency} ${Math.abs(val).toLocaleString(\'pt-PT\', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;',
  'const sign = val < 0 ? \'-\' : \'\';\n    return `${currency} ${sign}${Math.abs(val).toLocaleString(\'pt-PT\', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;'
);

fs.writeFileSync('components/LadderView.tsx', content);
