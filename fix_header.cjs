const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
    `<p className="text-slate-400 text-lg mt-1">{view === 'ladder' ? 'Calculadora de Trading' : (view === 'annual' ? \`Ano de \${selectedDate.year}\` : \`\${months[selectedDate.month]} \${selectedDate.year}\`)}</p>`,
    `{view !== 'ladder' && <p className="text-slate-400 text-lg mt-1">{view === 'annual' ? \`Ano de \${selectedDate.year}\` : \`\${months[selectedDate.month]} \${selectedDate.year}\`}</p>}`
);

fs.writeFileSync('App.tsx', content);
