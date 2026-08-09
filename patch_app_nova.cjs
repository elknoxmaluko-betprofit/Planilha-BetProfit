const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /<i className="fas fa-plus-circle w-6"><\/i> Registar/,
  '<i className="fas fa-plus-circle w-6"></i> Nova Entrada'
);

fs.writeFileSync('App.tsx', content);
