const fs = require('fs');
let content = fs.readFileSync('components/LadderView.tsx', 'utf8');

const toReplace = `<table className="w-full text-center border-collapse text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-md">
          <thead>
            <tr>
              <th className="w-1/4 py-3 text-slate-800 bg-[#ffb3b3] border-r border-slate-900">Lays</th>
              <th className="w-1/4 py-3 text-slate-400 bg-slate-900">Odd</th>
              <th className="w-1/4 py-3 text-slate-800 bg-[#99ccff] border-l border-slate-900">Backs</th>
              <th className="w-1/4 py-3 text-slate-800 bg-slate-200 border-l border-slate-900">Hedge</th>
            </tr>
          </thead>
        </table>
        
        <div ref={ladderRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-center border-collapse text-sm">`;

const replaceWith = `<div ref={ladderRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative">
          <table className="w-full text-center border-collapse text-sm table-fixed">
            <thead className="text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-md">
              <tr>
                <th className="w-1/4 py-3 text-slate-800 bg-[#ffb3b3] border-r border-slate-900">Lays</th>
                <th className="w-1/4 py-3 text-slate-400 bg-slate-900">Odd</th>
                <th className="w-1/4 py-3 text-slate-800 bg-[#99ccff] border-l border-slate-900">Backs</th>
                <th className="w-1/4 py-3 text-slate-800 bg-slate-200 border-l border-slate-900">Hedge</th>
              </tr>
            </thead>`;

content = content.replace(toReplace, replaceWith);
fs.writeFileSync('components/LadderView.tsx', content);
