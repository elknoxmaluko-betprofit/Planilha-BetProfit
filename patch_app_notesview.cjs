const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /\{view === 'notes' && <NotesView bets=\{filteredBets\} onUpdateBet=\{updateBet\} currency=\{currency\} \/>\}/g,
  "{view === 'notes' && <NotesView bets={filteredBets} onUpdateBet={updateBet} currency={currency} availableTags={tagsList} />}"
);

fs.writeFileSync('App.tsx', content);
