const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

// The chart calculation in stats useMemo
const oldStatsCalc = `    const dailyMap: Record<string, number> = {};
    let currentBalancePct = 0;

    sortedBets.forEach(b => {
      profit += b.profit;
      invested += b.stake;
      currentBalance += b.profit;
      
      const pctProfit = b.stake > 0 ? (b.profit / b.stake) * 100 : 0;
      currentBalancePct += pctProfit;
      
      if (currentBalancePct > peak) peak = currentBalancePct;
      const dd = peak - currentBalancePct;
      if (dd > maxDrawdown) maxDrawdown = dd;

      if (b.status !== BetStatus.PENDING) {
        totalSettled += 1;
        if (b.status === BetStatus.WON) {
            won += 1;
            winningBets.push(pctProfit);
        } else if (b.status === BetStatus.LOST || b.status === BetStatus.HALF_LOST) {
            losingBets.push(pctProfit);
        }
      }

      const d = b.date.split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = 0;
      dailyMap[d] += b.profit; // Keep chart in currency or percentage? Let's keep chart in currency for now, the user specifically asked for "advanced metrics"
    });`;

const newStatsCalc = `    const dailyMap: Record<string, number> = {};
    let currentBalancePct = 0;

    sortedBets.forEach(b => {
      profit += b.profit;
      invested += b.stake;
      currentBalance += b.profit;
      
      const pctProfit = b.stake > 0 ? (b.profit / b.stake) * 100 : 0;
      currentBalancePct += pctProfit;
      
      if (currentBalancePct > peak) peak = currentBalancePct;
      const dd = peak - currentBalancePct;
      if (dd > maxDrawdown) maxDrawdown = dd;

      if (b.status !== BetStatus.PENDING) {
        totalSettled += 1;
        if (b.status === BetStatus.WON) {
            won += 1;
            winningBets.push(pctProfit);
        } else if (b.status === BetStatus.LOST || b.status === BetStatus.HALF_LOST) {
            losingBets.push(pctProfit);
        }
      }

      const d = b.date.split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = 0;
      dailyMap[d] += b.profit;
    });`;
content = content.replace(oldStatsCalc, newStatsCalc);

// P/L Líquido div
const oldPL = `<div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">P/L Líquido</p>
              <p className={\`text-2xl font-bold \${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                {stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}
              </p>
            </div>`;

const newPL = `<div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">P/L Líquido</p>
              <p className={\`text-2xl font-bold flex items-end gap-2 \${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                <span>{stats.profit >= 0 ? '+' : ''}{formatCurrency(stats.profit)}</span>
                {monthlyStake > 0 && (
                  <span className="text-sm opacity-70 mb-1 font-mono">
                    ({stats.profit >= 0 ? '+' : ''}{(stats.profit / monthlyStake * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>`;
content = content.replace(oldPL, newPL);

// YAxis
const oldYAxis = `<YAxis 
                           stroke="#475569" 
                           fontSize={10} 
                           tickLine={false} 
                           axisLine={false} 
                           domain={['auto', 'auto']}
                           tickFormatter={(value) => \`\${value > 0 ? '+' : ''}\${value.toFixed(0)}\`}
                        />`;

const newYAxis = `<YAxis 
                           stroke="#475569" 
                           fontSize={10} 
                           tickLine={false} 
                           axisLine={false} 
                           domain={['auto', 'auto']}
                           tickFormatter={(value) => {
                             if (monthlyStake > 0) {
                               const pct = (value / monthlyStake) * 100;
                               return \`\${pct > 0 ? '+' : ''}\${pct.toFixed(0)}%\`;
                             }
                             return \`\${value > 0 ? '+' : ''}\${value.toFixed(0)}\`;
                           }}
                        />`;
content = content.replace(oldYAxis, newYAxis);

// Tooltip
const oldTooltip = `<div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className={\`font-bold \${val >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
            P/L Acum: {formatCurrency(val)}
          </p>
        </div>`;

const newTooltip = `<div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className={\`font-bold \${val >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
            P/L Acum: {formatCurrency(val)} {monthlyStake > 0 && <span className="opacity-70 text-sm">({val >= 0 ? '+' : ''}{(val / monthlyStake * 100).toFixed(1)}%)</span>}
          </p>
        </div>`;
content = content.replace(oldTooltip, newTooltip);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
