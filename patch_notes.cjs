const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Add import
if (!content.includes('import NotesView')) {
  content = content.replace(
    /import LadderView from '\.\/components\/LadderView';/,
    "import LadderView from './components/LadderView';\nimport NotesView from './components/NotesView';"
  );
}

// 2. Add to menu
const newButton = `
          <button onClick={() => handleViewChange('notes')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'notes' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-edit w-6"></i> Anotações
          </button>`;

content = content.replace(
  /<button onClick=\{\(\) => handleViewChange\('bets'\)\}[\s\S]*?<\/button>/,
  match => match + newButton
);

// 3. Add to views
const newRoute = `\n        {view === 'notes' && <NotesView bets={filteredBets} onUpdateBet={updateBet} currency={currency} />}`;

content = content.replace(
  /\{view === 'bets' && <BetList [\s\S]*?\/>\}/,
  match => match + newRoute
);

fs.writeFileSync('App.tsx', content);
