const fs = require('fs');

const files = [
  'components/MethodologiesView.tsx',
  'components/TagsView.tsx',
  'components/LeaguesView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /if \(\(e\.target as HTMLElement\)\.closest\('button'\) \|\| \(e\.target as HTMLElement\)\.closest\('form'\)\)/g,
    "if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('form') || (e.target as HTMLElement).closest('.group\\\\/edit'))"
  );
  content = content.replace(
    /if \(\(e\.target as HTMLElement\)\.closest\('button'\) \|\| \(e\.target as HTMLElement\)\.closest\('form'\) \|\| \(e\.target as HTMLElement\)\.closest\('\.group\\\\\/badge'\)\)/g,
    "if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('form') || (e.target as HTMLElement).closest('.group\\\\/badge') || (e.target as HTMLElement).closest('.group\\\\/edit'))"
  );
  fs.writeFileSync(file, content);
}
