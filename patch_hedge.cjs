const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

const handleLadderClickRegex = /const handleLadderClick = \[\s\S\]\*?\}\];\s*\};/;
const replacement = `
  const handleLadderClick = (odd: number, type: 'LAY' | 'BACK') => {
    if (stake <= 0) return;
    setBets(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      odd,
      stake
    }]);
  };

  const handleHedgeClick = (odd: number) => {
    if (bets.length === 0) return;
    const requiredStake = (posLose - posWin) / odd;
    if (Math.abs(requiredStake) < 0.01) return;
    
    setBets(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type: requiredStake > 0 ? 'BACK' : 'LAY',
      odd,
      stake: Math.abs(requiredStake)
    }]);
  };
`;

content = content.replace(
  `  const handleLadderClick = (odd: number, type: 'LAY' | 'BACK') => {
    if (stake <= 0) return;
    setBets(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      odd,
      stake
    }]);
  };`, replacement.trim());


const oldHedgeTd = `<td className="w-1/4 py-1.5 px-1 bg-slate-200 text-black border-l border-slate-900 font-bold">
                      {hasPositions ? (
                        <span className={hedgeProfit > 0 ? 'text-green-600' : hedgeProfit < 0 ? 'text-red-600' : 'text-slate-600'}>
                          {formatCurrency(hedgeProfit)}
                        </span>
                      ) : ''}
                    </td>`;

const newHedgeTd = `<td 
                      className="w-1/4 py-1.5 px-1 bg-slate-200 hover:bg-slate-300 text-black border-l border-slate-900 font-bold cursor-pointer transition-colors"
                      onClick={() => handleHedgeClick(odd)}
                    >
                      {hasPositions ? (
                        <span className={hedgeProfit > 0 ? 'text-green-600' : hedgeProfit < 0 ? 'text-red-600' : 'text-slate-600'}>
                          {formatCurrency(hedgeProfit)}
                        </span>
                      ) : ''}
                    </td>`;

content = content.replace(oldHedgeTd, newHedgeTd);

fs.writeFileSync('components/LadderView.tsx', content);
