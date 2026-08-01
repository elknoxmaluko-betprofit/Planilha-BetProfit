const fs = require('fs');
let content = fs.readFileSync('components/MethodologiesView.tsx', 'utf8');
content = content.replace(
  /onClose=\{\(\) => setViewingMethodology\(null\)\}/,
  'onClose={() => setViewingMethodology(null)}\n          type="methodology"'
);
fs.writeFileSync('components/MethodologiesView.tsx', content);
