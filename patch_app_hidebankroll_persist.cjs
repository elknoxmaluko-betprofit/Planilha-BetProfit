const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  "const [hideBankroll, setHideBankroll] = useState(false);",
  "const [hideBankroll, setHideBankroll] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_bankroll'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });"
);

content = content.replace(
  "                   <button onClick={() => setHideBankroll(!hideBankroll)} className=\"text-slate-500 hover:text-white transition-colors ml-2 focus:outline-none\">",
  "                   <button onClick={() => { const val = !hideBankroll; setHideBankroll(val); localStorage.setItem('betprofit_hide_bankroll', JSON.stringify(val)); }} className=\"text-slate-500 hover:text-white transition-colors ml-2 focus:outline-none\">"
);

fs.writeFileSync('App.tsx', content);
