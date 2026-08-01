const fs = require('fs');
let content = fs.readFileSync('components/TagsView.tsx', 'utf8');
content = content.replace(
  /onClose=\{\(\) => setViewingCategory\(null\)\}/,
  'onClose={() => setViewingCategory(null)}\n          type="tag"'
);
fs.writeFileSync('components/TagsView.tsx', content);
