const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const stateMatch = "const [hideBankroll, setHideBankroll] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_bankroll'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });";
const stateReplace = stateMatch + "\n  const [hideStake, setHideStake] = useState(() => { try { const stored = localStorage.getItem('betprofit_hide_stake'); return stored ? JSON.parse(stored) : false; } catch (e) { return false; } });";

content = content.replace(stateMatch, stateReplace);

const stakeMatch = `<div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Stake:</label>
                   <input type="number" className="bg-transparent border-none text-yellow-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyStake || ''} onChange={(e) => updateMonthlyStake(e.target.value)} />
                   <span className="text-slate-500 text-lg">{currency}</span>
                </div>`;

const stakeReplace = `<div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Stake:</label>
                   {hideStake ? (
                     <div className="w-24 text-yellow-400 font-mono font-bold text-lg flex items-center">******</div>
                   ) : (
                     <input type="number" className="bg-transparent border-none text-yellow-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyStake || ''} onChange={(e) => updateMonthlyStake(e.target.value)} />
                   )}
                   <span className="text-slate-500 text-lg">{currency}</span>
                   <button onClick={() => { const val = !hideStake; setHideStake(val); localStorage.setItem('betprofit_hide_stake', JSON.stringify(val)); }} className="text-slate-500 hover:text-white transition-colors ml-2 focus:outline-none">
                     <i className={\`fas \${hideStake ? 'fa-eye' : 'fa-eye-slash'}\`}></i>
                   </button>
                </div>`;

content = content.replace(stakeMatch, stakeReplace);
fs.writeFileSync('App.tsx', content);
