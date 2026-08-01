const fs = require('fs');
let content = fs.readFileSync('components/LeaguesView.tsx', 'utf8');
content = content.replace(
  /onClose=\{\(\) => setViewingCategory\(null\)\}/,
  'onClose={() => setViewingCategory(null)}\n          type="league"'
);
fs.writeFileSync('components/LeaguesView.tsx', content);
