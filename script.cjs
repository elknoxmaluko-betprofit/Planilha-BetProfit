const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const stateMatch = "const [hideStake, setHideStake] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_stake'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });";
const stateReplace = stateMatch + "\n  const [isAnnualMenuOpen, setIsAnnualMenuOpen] = useState(false);";

content = content.replace(stateMatch, stateReplace);

const navRegex = /<button onClick=\{\(\) => handleViewChange\('markets'\)\}[\s\S]*?<button onClick=\{\(\) => handleViewChange\('annual'\)\}.*?<\/button>/;

// Let's replace the navigation buttons to group them.
