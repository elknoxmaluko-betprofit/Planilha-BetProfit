const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

// Ensure the header has 4 columns
const headerOld = '<div className="grid grid-cols-4 text-center font-bold text-xs uppercase tracking-wider bg-slate-900 border-b border-slate-800">';
const headerContentOld = `
          <div className="p-3 text-slate-800 bg-[#ffb3b3]">Lays</div>
          <div className="p-3 text-slate-400">Odd</div>
          <div className="p-3 text-slate-800 bg-[#99ccff]">Backs</div>
          <div className="p-3 text-slate-800 bg-slate-200"></div>
        </div>`;

const headerContentNew = `
          <div className="p-3 text-slate-800 bg-[#ffb3b3]">Lays</div>
          <div className="p-3 text-slate-400">Odd</div>
          <div className="p-3 text-slate-800 bg-[#99ccff]">Backs</div>
          <div className="p-3 text-slate-800 bg-slate-200">Hedge</div>
        </div>`;
content = content.replace(headerContentOld, headerContentNew);

// Rewrite the map function to have exactly 4 columns with correct logic
const newMap = `
              {odds.map(odd => {
                const layBetsAtOdd = layBets.filter(b => b.odd === odd);
                const backBetsAtOdd = backBets.filter(b => b.odd === odd);
                const layLiabilityAtOdd = layBetsAtOdd.reduce((sum, b) => sum + b.stake * (b.odd - 1), 0);
                const backStakeAtOdd = backBetsAtOdd.reduce((sum, b) => sum + b.stake, 0);
                
                const hedgeProfit = posLose - ((posLose - posWin) / odd);
                const hasPositions = bets.length > 0;
                const isTarget = odd === 2;
                
                return (
                  <tr key={odd} ref={isTarget ? targetOddRef : null} className="group border-b border-slate-800/50">
                    <td 
                      className="w-1/4 py-1.5 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-red-600 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner"
                      onClick={() => handleLadderClick(odd, 'LAY')}
                    >
                      {layLiabilityAtOdd > 0 ? formatCurrency(-layLiabilityAtOdd) : ''}
                    </td>
                    <td className="w-1/4 py-1.5 bg-[#0f172a] text-white font-bold cursor-default">
                      {odd.toFixed(2)}
                    </td>
                    <td 
                      className="w-1/4 py-1.5 px-1 bg-[#bbdefb] hover:bg-[#99ccff] text-blue-800 font-bold cursor-pointer border-l border-slate-900 transition-all shadow-inner"
                      onClick={() => handleLadderClick(odd, 'BACK')}
                    >
                      {backStakeAtOdd > 0 ? formatCurrency(backStakeAtOdd) : ''}
                    </td>
                    <td className="w-1/4 py-1.5 px-1 bg-slate-200 text-black border-l border-slate-900 font-bold">
                      {hasPositions ? (
                        <span className={hedgeProfit > 0 ? 'text-green-600' : hedgeProfit < 0 ? 'text-red-600' : 'text-slate-600'}>
                          {formatCurrency(hedgeProfit)}
                        </span>
                      ) : ''}
                    </td>
                  </tr>
                );
              })}
`;

content = content.replace(/\{odds\.map\(odd => \{[\s\S]*?\}\)\}/, newMap.trim());

fs.writeFileSync('components/LadderView.tsx', content);
