const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

content = content.replace(
  'const layLiabilityAtOdd = layBetsAtOdd.reduce((sum, b) => sum + b.stake * (b.odd - 1), 0);',
  'const layLiability = -(odd - 1) * stake;\n                const backProfit = (odd - 1) * stake;'
);

content = content.replace(
  '<div className="grid grid-cols-4 text-center font-bold text-xs uppercase tracking-wider bg-slate-900 border-b border-slate-800">',
  '<div className="grid grid-cols-3 text-center font-bold text-xs uppercase tracking-wider bg-slate-900 border-b border-slate-800">'
);

content = content.replace(
  '<div className="p-3 text-slate-800 bg-slate-200">Hedge</div>',
  ''
);

content = content.replace(
  /<td className="w-1\/4 py-1\.5 px-1 bg-slate-200 text-black border-l border-slate-900 font-bold">[\s\S]*?<\/td>/m,
  ''
);

content = content.replace(/w-1\/4/g, 'w-1/3');

content = content.replace(
  'className="w-1/3 py-1.5 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-slate-900 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner"',
  'className="w-1/3 py-1.5 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-red-600 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner"'
);

fs.writeFileSync('components/LadderView.tsx', content);
