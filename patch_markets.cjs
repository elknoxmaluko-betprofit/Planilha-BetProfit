const fs = require('fs');
let content = fs.readFileSync('components/MarketsView.tsx', 'utf8');

// Update imports
content = content.replace(
  /import \{ Bet, MarketStats, BetStatus \} from '\.\.\/types';/,
  `import { Bet, MarketStats, BetStatus } from '../types';
import CategoryDetailsModal from './CategoryDetailsModal';`
);

// Update props interface
content = content.replace(
  /interface MarketsViewProps \{/,
  'interface MarketsViewProps {\n  monthlyStake: number;'
);

// Update component definition
content = content.replace(
  /const MarketsView: React\.FC<MarketsViewProps> = \(\{ bets, currency \}\) => \{/,
  'const MarketsView: React.FC<MarketsViewProps> = ({ bets, currency, monthlyStake }) => {\n  const [viewingMarket, setViewingMarket] = React.useState<string | null>(null);'
);

// Update the card click handler
const oldCard = `<div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">`;
const newCard = `<div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-sm cursor-pointer" onClick={() => setViewingMarket(market.name)}>`;
content = content.replace(oldCard, newCard);

// Update the P/L Líquido display in the card
const oldPL = `<p className={\`font-mono font-bold \${market.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                  {market.profit >= 0 ? '+' : ''}{market.profit.toFixed(2)}{currency}
                </p>`;
const newPL = `<p className={\`font-mono font-bold \${market.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                  {market.profit >= 0 ? '+' : ''}{market.profit.toFixed(2)}{currency}
                  {monthlyStake > 0 && <span className="text-[10px] ml-1 opacity-70">({market.profit >= 0 ? '+' : ''}{(market.profit / monthlyStake * 100).toFixed(0)}%)</span>}
                </p>`;
content = content.replace(oldPL, newPL);

// Add CategoryDetailsModal at the end of the return statement
const returnEnd = `      </div>
    </div>
  );
};`;
const newReturnEnd = `      </div>
      
      {viewingMarket && (
        <CategoryDetailsModal
          title={viewingMarket}
          icon={viewingMarket.toUpperCase().includes('FIRST HALF') ? 'fa-stopwatch' : 'fa-flag-checkered'}
          bets={bets.filter(b => b.market === viewingMarket)}
          currency={currency}
          monthlyStake={monthlyStake}
          onClose={() => setViewingMarket(null)}
          type="methodology" 
        />
      )}
    </div>
  );
};`;
content = content.replace(returnEnd, newReturnEnd);

fs.writeFileSync('components/MarketsView.tsx', content);
