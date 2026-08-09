const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /<button onClick=\{\(\) => handleViewChange\('notes'\)\} className=\{`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \$\{view === 'notes' \? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400\/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'\}`\}>\s*<i className="fas fa-edit w-6"><\/i> Anotações\s*<\/button>\s*<button onClick=\{\(\) => handleViewChange\('notes'\)\} className=\{`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \$\{view === 'notes' \? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400\/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'\}`\}>\s*<i className="fas fa-edit w-6"><\/i> Anotações\s*<\/button>/;

const replacement = `<button onClick={() => handleViewChange('notes')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'notes' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-edit w-6"></i> Anotações
          </button>`;

content = content.replace(regex, replacement);

fs.writeFileSync('App.tsx', content);
