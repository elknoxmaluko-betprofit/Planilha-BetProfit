const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(/\\n          <button onClick=\{\(\) => handleViewChange\('ladder'\)/, '\n          <button onClick={() => handleViewChange(\'ladder\')');

fs.writeFileSync('App.tsx', content);
