const fs = require('fs');
let content = fs.readFileSync('components/TeamsView.tsx', 'utf8');
content = content.replace(
  /onClose=\{\(\) => setViewingCategory\(null\)\}/,
  'onClose={() => setViewingCategory(null)}\n          type="team"'
);
fs.writeFileSync('components/TeamsView.tsx', content);
