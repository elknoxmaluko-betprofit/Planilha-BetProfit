const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

content = content.replace(
  /<Logo size="lg" \/>/,
  '<Logo size="sm" />'
);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
