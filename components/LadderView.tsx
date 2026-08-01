import React, { useState, useMemo, useEffect, useRef } from 'react';

const generateLadderOdds = () => {
  let odds: number[] = [];
  
  const addRange = (start: number, end: number, step: number) => {
    for (let i = start; i < end - (step/2); i += step) {
      odds.push(Math.round(i * 100) / 100);
    }
  };

  addRange(1.01, 2.00, 0.01);
  addRange(2.00, 3.00, 0.02);
  addRange(3.00, 4.00, 0.05);
  addRange(4.00, 6.00, 0.10);
  addRange(6.00, 10.0, 0.20);
  addRange(10.0, 20.0, 0.50);
  addRange(20.0, 30.0, 1.0);
  addRange(30.0, 50.0, 2.0);
  addRange(50.0, 100.0, 5.0);
  
  for (let i = 100.0; i <= 1000.0; i += 10.0) {
    odds.push(Math.round(i * 100) / 100);
  }

  odds = Array.from(new Set(odds));
  return odds.sort((a, b) => b - a);
};

interface SimBet {
  id: string;
  type: 'LAY' | 'BACK';
  odd: number;
  stake: number;
}

interface LadderViewProps {
  currency: string;
}

const LadderView: React.FC<LadderViewProps> = ({ currency }) => {
  const [stake, setStake] = useState<number>(10);
  const [stakeMode, setStakeMode] = useState<'STAKE' | 'LIABILITY'>('STAKE');
  const [bets, setBets] = useState<SimBet[]>([]);
  const [activeTab, setActiveTab] = useState<'LAYS' | 'BACKS'>('LAYS');
  
  const ladderRef = useRef<HTMLDivElement>(null);
  const targetOddRef = useRef<HTMLTableRowElement>(null);
  
  const odds = useMemo(() => generateLadderOdds(), []);

  useEffect(() => {
    setTimeout(() => {
      if (targetOddRef.current && ladderRef.current) {
          targetOddRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }, 100);
  }, []);

  const posWin = useMemo(() => {
    let profit = 0;
    bets.forEach(b => {
      if (b.type === 'BACK') profit += b.stake * (b.odd - 1);
      if (b.type === 'LAY') profit -= b.stake * (b.odd - 1);
    });
    return profit;
  }, [bets]);

  const posLose = useMemo(() => {
    let profit = 0;
    bets.forEach(b => {
      if (b.type === 'BACK') profit -= b.stake;
      if (b.type === 'LAY') profit += b.stake;
    });
    return profit;
  }, [bets]);

  const layBets = bets.filter(b => b.type === 'LAY');
  const backBets = bets.filter(b => b.type === 'BACK');
  
  const totalLayStake = layBets.reduce((sum, b) => sum + b.stake, 0);
  const totalBackStake = backBets.reduce((sum, b) => sum + b.stake, 0);
  
  const avgLayOdd = totalLayStake > 0 ? layBets.reduce((sum, b) => sum + (b.odd * b.stake), 0) / totalLayStake : 0;
  const avgBackOdd = totalBackStake > 0 ? backBets.reduce((sum, b) => sum + (b.odd * b.stake), 0) / totalBackStake : 0;
  
  const totalLayLiability = layBets.reduce((sum, b) => sum + b.stake * (b.odd - 1), 0);
  const totalBackProfit = backBets.reduce((sum, b) => sum + b.stake * (b.odd - 1), 0);

  const handleLadderClick = (odd: number, type: 'LAY' | 'BACK') => {
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

  const removeBet = (id: string) => {
    setBets(prev => prev.filter(b => b.id !== id));
  };

  const clearBets = () => setBets([]);

  const formatCurrency = (val: number) => {
    const sign = val < 0 ? '-' : '';
    return `${currency} ${sign}${Math.abs(val).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-12rem)] min-h-[600px]">
      
      {/* Left: Ladder */}
      <div className="w-full lg:w-[450px] flex flex-col bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div ref={ladderRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative">
          <table className="w-full text-center border-collapse text-sm table-fixed">
            <thead className="text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-md">
              <tr>
                <th className="w-1/4 py-3 text-slate-800 bg-[#ffb3b3] border-r border-slate-900">Lays</th>
                <th className="w-1/4 py-3 text-slate-400 bg-slate-900">Odd</th>
                <th className="w-1/4 py-3 text-slate-800 bg-[#99ccff] border-l border-slate-900">Backs</th>
                <th className="w-1/4 py-3 text-slate-800 bg-slate-200 border-l border-slate-900">Hedge</th>
              </tr>
            </thead>
            <tbody>
              {odds.map(odd => {
                const layBetsAtOdd = layBets.filter(b => b.odd === odd);
                const backBetsAtOdd = backBets.filter(b => b.odd === odd);
                const layLiabilityAtOdd = layBetsAtOdd.reduce((sum, b) => sum + b.stake * (b.odd - 1), 0);
                const backStakeAtOdd = backBetsAtOdd.reduce((sum, b) => sum + b.stake, 0);
                
                const hedgeProfit = posLose - ((posLose - posWin) / odd);
                const hasPositions = bets.length > 0;
                const isTarget = odd === 2;
                
                const requiredHedgeStake = hasPositions ? (posLose - posWin) / odd : 0;
                const hedgeTitle = hasPositions ? `Clique para fazer cashout:\nApostar ${formatCurrency(Math.abs(requiredHedgeStake))} em ${requiredHedgeStake > 0 ? 'BACK' : 'LAY'}` : '';

                return (
                  <tr key={odd} ref={isTarget ? targetOddRef : null} className="group border-b border-slate-800/50">
                    <td 
                      className="w-1/4 py-1 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-red-600 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner text-center whitespace-nowrap"
                      onClick={() => handleLadderClick(odd, 'LAY')}
                    >
                      {layLiabilityAtOdd > 0 ? formatCurrency(-layLiabilityAtOdd) : ''}
                    </td>
                    <td className="w-1/4 py-1 bg-[#0f172a] text-white font-bold cursor-default text-center whitespace-nowrap">
                      {odd.toFixed(2)}
                    </td>
                    <td 
                      className="w-1/4 py-1 px-1 bg-[#bbdefb] hover:bg-[#99ccff] text-blue-800 font-bold cursor-pointer border-l border-slate-900 transition-all shadow-inner text-center whitespace-nowrap"
                      onClick={() => handleLadderClick(odd, 'BACK')}
                    >
                      {backStakeAtOdd > 0 ? formatCurrency(backStakeAtOdd) : ''}
                    </td>
                    <td 
                      className="w-1/4 py-1 px-1 bg-slate-200 hover:bg-slate-300 text-black border-l border-slate-900 font-bold cursor-pointer transition-colors text-center whitespace-nowrap"
                      onClick={() => handleHedgeClick(odd)}
                      title={hedgeTitle}
                    >
                      {hasPositions ? (
                        <span className={hedgeProfit > 0 ? 'text-green-600' : hedgeProfit < 0 ? 'text-red-600' : 'text-slate-600'}>
                          {formatCurrency(hedgeProfit)}
                        </span>
                      ) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex-1 flex flex-col gap-6">
         <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 flex justify-center items-center gap-4 shadow-lg">
            <div className="relative min-w-[180px]">
                <select
                    value={stakeMode}
                    onChange={(e) => setStakeMode(e.target.value as 'STAKE' | 'LIABILITY')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-300 font-bold appearance-none cursor-pointer outline-none focus:border-yellow-400"
                >
                    <option value="STAKE">Stake</option>
                    <option value="LIABILITY">Responsabilidade</option>
                </select>
                <i className="fas fa-chevron-down text-xs text-slate-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"></i>
            </div>
            <div className="relative flex-1 max-w-[200px]">
                 <input
                     type="number"
                     value={stake}
                     onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                     className="w-full bg-slate-900 text-white font-bold text-center py-3 rounded-lg border border-slate-700 focus:border-yellow-400 outline-none"
                 />
            </div>
         </div>

         <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-lg flex justify-around text-center">
            <div>
               <p className="text-sm text-slate-400 font-bold mb-1">Lay Vencedor</p>
               <p className={`text-xl font-black ${posLose > 0 ? 'text-green-500' : posLose < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                  {formatCurrency(posLose)}
               </p>
            </div>
            <div>
               <p className="text-sm text-slate-400 font-bold mb-1">Back Vencedor</p>
               <p className={`text-xl font-black ${posWin > 0 ? 'text-green-500' : posWin < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                  {formatCurrency(posWin)}
               </p>
            </div>
         </div>

         <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-lg">
             <table className="w-full text-center text-sm">
                 <thead>
                     <tr className="text-slate-400 font-bold">
                         <th className="pb-4 text-left w-20"></th>
                         <th className="pb-4">Stake</th>
                         <th className="pb-4">Odd</th>
                         <th className="pb-4">P/L</th>
                     </tr>
                 </thead>
                 <tbody className="font-medium text-white">
                     <tr className="border-t border-slate-800/50">
                         <td className="py-3 text-left font-bold text-slate-300">Lay</td>
                         <td className="py-3">{formatCurrency(totalLayStake)}</td>
                         <td className="py-3">{avgLayOdd.toFixed(2)}</td>
                         <td className="py-3">{formatCurrency(totalLayLiability)}</td>
                     </tr>
                     <tr className="border-t border-slate-800/50">
                         <td className="py-3 text-left font-bold text-slate-300">Back</td>
                         <td className="py-3">{formatCurrency(totalBackStake)}</td>
                         <td className="py-3">{avgBackOdd.toFixed(2)}</td>
                         <td className="py-3">{formatCurrency(totalBackProfit)}</td>
                     </tr>
                 </tbody>
             </table>
         </div>

         <div className="bg-[#111827] rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-lg">
             <div className="flex font-bold text-sm text-center">
                 <button 
                    onClick={() => setActiveTab('LAYS')}
                    className={`flex-1 py-3 transition-colors ${activeTab === 'LAYS' ? 'bg-[#ffb3b3] text-black' : 'bg-[#ffcdd2]/10 text-pink-300/50 hover:bg-[#ffcdd2]/20'}`}
                 >
                     Lays
                 </button>
                 <button 
                    onClick={() => setActiveTab('BACKS')}
                    className={`flex-1 py-3 transition-colors ${activeTab === 'BACKS' ? 'bg-[#99ccff] text-black' : 'bg-[#bbdefb]/10 text-blue-300/50 hover:bg-[#bbdefb]/20'}`}
                 >
                     Backs
                 </button>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto">
                 {(activeTab === 'LAYS' ? layBets : backBets).map((bet) => (
                     <div key={bet.id} className="flex justify-between items-center bg-slate-900/80 rounded-lg p-3 mb-2 border border-slate-800 text-sm">
                         <span className="text-slate-300 font-medium">
                            Resp.: <strong className="text-white">{formatCurrency(bet.stake * (bet.odd - 1))}</strong> - Odd: <strong className="text-white">{bet.odd.toFixed(2)}</strong>
                         </span>
                         <button onClick={() => removeBet(bet.id)} className="text-slate-500 hover:text-red-400 p-2">
                             <i className="fas fa-trash"></i>
                         </button>
                     </div>
                 ))}
                 {(activeTab === 'LAYS' ? layBets : backBets).length === 0 && (
                     <div className="text-slate-500 text-center py-8 font-medium">
                         Nenhuma aposta {activeTab === 'LAYS' ? 'Lay' : 'Back'} registada.
                     </div>
                 )}
             </div>

             <div className="p-4 border-t border-slate-800">
                 <button 
                    onClick={clearBets}
                    className="w-full py-3 bg-[#d97706] hover:bg-[#b45309] text-white font-bold rounded-lg transition-colors shadow-lg"
                 >
                     Limpar
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default LadderView;
