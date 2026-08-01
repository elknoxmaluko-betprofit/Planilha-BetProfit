const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

const oldHeader = `<div className="grid grid-cols-4 text-center font-bold text-xs uppercase tracking-wider bg-slate-900 border-b border-slate-800">
          <div className="p-3 text-slate-800 bg-[#ffb3b3]">Lays</div>
          <div className="p-3 text-slate-400">Odd</div>
          <div className="p-3 text-slate-800 bg-[#99ccff]">Backs</div>
          <div className="p-3 text-slate-800 bg-slate-200">Hedge</div>
        </div>`;

const newHeader = `<table className="w-full text-center border-collapse text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-md">
          <thead>
            <tr>
              <th className="w-1/4 py-3 text-slate-800 bg-[#ffb3b3] border-r border-slate-900">Lays</th>
              <th className="w-1/4 py-3 text-slate-400 bg-slate-900">Odd</th>
              <th className="w-1/4 py-3 text-slate-800 bg-[#99ccff] border-l border-slate-900">Backs</th>
              <th className="w-1/4 py-3 text-slate-800 bg-slate-200 border-l border-slate-900">Hedge</th>
            </tr>
          </thead>
        </table>`;

content = content.replace(oldHeader, newHeader);

// make sure the body columns match width and borders
content = content.replace(
    'className="w-1/4 py-1.5 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-red-600 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner"',
    'className="w-1/4 py-1 px-1 bg-[#ffcdd2] hover:bg-[#ffb3b3] text-red-600 font-bold cursor-pointer border-r border-slate-900 transition-all shadow-inner text-center whitespace-nowrap"'
);

content = content.replace(
    'className="w-1/4 py-1.5 bg-[#0f172a] text-white font-bold cursor-default"',
    'className="w-1/4 py-1 bg-[#0f172a] text-white font-bold cursor-default text-center whitespace-nowrap"'
);

content = content.replace(
    'className="w-1/4 py-1.5 px-1 bg-[#bbdefb] hover:bg-[#99ccff] text-blue-800 font-bold cursor-pointer border-l border-slate-900 transition-all shadow-inner"',
    'className="w-1/4 py-1 px-1 bg-[#bbdefb] hover:bg-[#99ccff] text-blue-800 font-bold cursor-pointer border-l border-slate-900 transition-all shadow-inner text-center whitespace-nowrap"'
);

content = content.replace(
    'className="w-1/4 py-1.5 px-1 bg-slate-200 hover:bg-slate-300 text-black border-l border-slate-900 font-bold cursor-pointer transition-colors"',
    'className="w-1/4 py-1 px-1 bg-slate-200 hover:bg-slate-300 text-black border-l border-slate-900 font-bold cursor-pointer transition-colors text-center whitespace-nowrap"'
);

fs.writeFileSync('components/LadderView.tsx', content);
