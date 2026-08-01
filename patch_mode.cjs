const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

// Add stakeMode state
content = content.replace(
  'const [stake, setStake] = useState<number>(10);',
  `const [stake, setStake] = useState<number>(10);
  const [stakeMode, setStakeMode] = useState<'STAKE' | 'LIABILITY'>('STAKE');`
);

// Replace the Stake display with a select
const oldStakeDiv = `<div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 font-bold flex items-center min-w-[120px] justify-between cursor-not-allowed opacity-80">
                Stake <i className="fas fa-chevron-down text-xs ml-4"></i>
            </div>`;
const newStakeDiv = `<div className="relative min-w-[180px]">
                <select
                    value={stakeMode}
                    onChange={(e) => setStakeMode(e.target.value as 'STAKE' | 'LIABILITY')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 font-bold appearance-none cursor-pointer outline-none focus:border-yellow-400"
                >
                    <option value="STAKE">Stake</option>
                    <option value="LIABILITY">Responsabilidade</option>
                </select>
                <i className="fas fa-chevron-down text-xs text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"></i>
            </div>`;

content = content.replace(oldStakeDiv, newStakeDiv);

// Update handleLadderClick logic
const oldHandleClick = `  const handleLadderClick = (odd: number, type: 'LAY' | 'BACK') => {
    if (stake <= 0) return;
    setBets(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      odd,
      stake
    }]);
  };`;

const newHandleClick = `  const handleLadderClick = (odd: number, type: 'LAY' | 'BACK') => {
    if (stake <= 0) return;
    
    let actualStake = stake;
    if (stakeMode === 'LIABILITY') {
      if (type === 'LAY') {
        actualStake = stake / (odd - 1);
      } else {
        // For BACK bets, liability (risk) is exactly the stake
        actualStake = stake;
      }
    }

    setBets(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      odd,
      stake: actualStake
    }]);
  };`;

content = content.replace(oldHandleClick, newHandleClick);

fs.writeFileSync('components/LadderView.tsx', content);
