const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
content = content.replace("  const [hideStake, setHideStake] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_stake'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });", "  const [hideStake, setHideStake] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_stake'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });\n  const [isAnnualMenuOpen, setIsAnnualMenuOpen] = useState(false);");
fs.writeFileSync('App.tsx', content);
