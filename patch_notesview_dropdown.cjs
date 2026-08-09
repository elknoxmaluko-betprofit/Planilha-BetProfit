const fs = require('fs');
let content = fs.readFileSync('components/NotesView.tsx', 'utf8');

const oldInput = `<td className="border border-slate-700 p-0 text-center">
                  <input 
                    type="text" 
                    value={bet.operationMoment || ''} 
                    onChange={(e) => onUpdateBet(bet.id, { operationMoment: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none focus:bg-slate-800"
                  />
                </td>`;

const newSelect = `<td className="border border-slate-700 p-0 text-center">
                  <select
                    value={bet.operationMoment || ''}
                    onChange={(e) => onUpdateBet(bet.id, { operationMoment: e.target.value })}
                    className="w-full h-full p-1 bg-transparent text-center text-slate-200 outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-300">-</option>
                    <option value="HT" className="bg-slate-900 text-white">HT</option>
                    <option value="FT" className="bg-slate-900 text-white">FT</option>
                    <option value="Prolongamento" className="bg-slate-900 text-white">Prolongamento</option>
                  </select>
                </td>`;

content = content.replace(oldInput, newSelect);
fs.writeFileSync('components/NotesView.tsx', content);
