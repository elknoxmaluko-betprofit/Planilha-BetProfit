const fs = require('fs');

const files = [
  'components/MethodologiesView.tsx',
  'components/TagsView.tsx',
  'components/LeaguesView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /onClick=\{\(\) => \{ setEditingName/g,
    'onClick={(e) => { e.stopPropagation(); setEditingName'
  );
  fs.writeFileSync(file, content);
}
