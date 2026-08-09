const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const stateMatch = "  const [currentDuplicateConflict, setCurrentDuplicateConflict] = useState<{ newBet: Bet, existingBet: Bet } | null>(null);";
const stateReplace = stateMatch + "\n  const [hideBankroll, setHideBankroll] = useState(false);";

content = content.replace(stateMatch, stateReplace);

const bankrollMatch = `<div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Banca:</label>
                   <input type="number" className="bg-transparent border-none text-emerald-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyBankroll || ''} onChange={(e) => updateMonthlyBankroll(e.target.value)} />
                   <span className="text-slate-500 text-lg">{currency}</span>
                </div>`;

const bankrollReplace = `<div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
                   <label className="text-xs uppercase font-black text-slate-500 tracking-widest">Banca:</label>
                   {hideBankroll ? (
                     <div className="w-24 text-emerald-400 font-mono font-bold text-lg flex items-center">******</div>
                   ) : (
                     <input type="number" className="bg-transparent border-none text-emerald-400 font-mono font-bold w-24 focus:ring-0 text-lg" value={currentMonthlyBankroll || ''} onChange={(e) => updateMonthlyBankroll(e.target.value)} />
                   )}
                   <span className="text-slate-500 text-lg">{currency}</span>
                   <button onClick={() => setHideBankroll(!hideBankroll)} className="text-slate-500 hover:text-white transition-colors ml-2 focus:outline-none">
                     <i className={\`fas \${hideBankroll ? 'fa-eye' : 'fa-eye-slash'}\`}></i>
                   </button>
                </div>`;

content = content.replace(bankrollMatch, bankrollReplace);
fs.writeFileSync('App.tsx', content);
