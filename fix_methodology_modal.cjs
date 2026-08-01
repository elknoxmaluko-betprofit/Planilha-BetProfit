const fs = require('fs');
let content = fs.readFileSync('components/MethodologyDetailsModal.tsx', 'utf8');

const oldStatsCalc = `    const dailyMap: Record<string, number> = {};

    methodBets.forEach(b => {
      profit += b.profit;
      invested += b.stake;
      currentBalance += b.profit;
      
      if (currentBalance > peak) peak = currentBalance;
      const dd = peak - currentBalance;
      if (dd > maxDrawdown) maxDrawdown = dd;

      if (b.status !== BetStatus.PENDING) {
        totalSettled += 1;
        if (b.status === BetStatus.WON) {
            won += 1;
            winningBets.push(b.profit);
        } else if (b.status === BetStatus.LOST || b.status === BetStatus.HALF_LOST) {
            losingBets.push(b.profit);
        }
      }

      const d = b.date.split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = 0;
      dailyMap[d] += b.profit;
    });

    const winRate = totalSettled > 0 ? (won / totalSettled) * 100 : 0;
    const roi = invested > 0 ? (profit / invested) * 100 : 0;
    const avgWin = winningBets.length > 0 ? winningBets.reduce((a, b) => a + b, 0) / winningBets.length : 0;
    const avgLoss = losingBets.length > 0 ? losingBets.reduce((a, b) => a + b, 0) / losingBets.length : 0;`;

const newStatsCalc = `    const dailyMap: Record<string, number> = {};
    let currentBalancePct = 0;

    methodBets.forEach(b => {
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
    });

    const winRate = totalSettled > 0 ? (won / totalSettled) * 100 : 0;
    const roi = invested > 0 ? (profit / invested) * 100 : 0;
    const avgWin = winningBets.length > 0 ? winningBets.reduce((a, b) => a + b, 0) / winningBets.length : 0;
    const avgLoss = losingBets.length > 0 ? losingBets.reduce((a, b) => a + b, 0) / losingBets.length : 0;`;

content = content.replace(oldStatsCalc, newStatsCalc);

const oldAdvancedMetrics = `             {/* Secondary Stats */}
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue-400"></i> Métricas Avançadas
                </h3>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Green</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(stats.avgWin)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Red</span>
                  <span className="text-red-400 font-bold">{formatCurrency(stats.avgLoss)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Max Drawdown</span>
                  <span className="text-red-400 font-bold">{formatCurrency(-stats.maxDrawdown)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Investimento Total</span>
                  <span className="text-white font-bold">{formatCurrency(stats.invested)}</span>
                </div>
             </div>`;

const newAdvancedMetrics = `             {/* Secondary Stats */}
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue-400"></i> Métricas Avançadas
                </h3>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Green</span>
                  <span className="text-emerald-400 font-bold">+{stats.avgWin.toFixed(2)}%</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Média de Red</span>
                  <span className="text-red-400 font-bold">{stats.avgLoss.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Max Drawdown</span>
                  <span className="text-red-400 font-bold">{-stats.maxDrawdown.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">ROI do Método</span>
                  <span className={\`font-bold \${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}\`}>
                    {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
                  </span>
                </div>
             </div>`;

content = content.replace(oldAdvancedMetrics, newAdvancedMetrics);

fs.writeFileSync('components/MethodologyDetailsModal.tsx', content);
