const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /\{view === 'notes' && <NotesView bets=\{filteredBets\} onUpdateBet=\{updateBet\} currency=\{currency\} \/>\}\n\s*\{view === 'notes' && <NotesView bets=\{filteredBets\} onUpdateBet=\{updateBet\} currency=\{currency\} \/>\}/,
  "{view === 'notes' && <NotesView bets={filteredBets} onUpdateBet={updateBet} currency={currency} />}"
);

fs.writeFileSync('App.tsx', content);
