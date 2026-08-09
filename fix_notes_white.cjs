const fs = require('fs');
let content = fs.readFileSync('components/NotesView.tsx', 'utf8');

content = content.replace(/bg-emerald-500\/80 text-slate-200/g, 'bg-emerald-500/80 text-white');
content = content.replace(/bg-orange-500\/80 text-slate-200/g, 'bg-orange-500/80 text-white');
content = content.replace(/bg-red-600\/80 text-slate-200/g, 'bg-red-600/80 text-white');

// table headers and filter label
content = content.replace(/text-slate-200 font-bold uppercase tracking-wider text-\[10px\] mr-2/g, 'text-white font-bold uppercase tracking-wider text-[10px] mr-2');
content = content.replace(/sticky top-0 bg-slate-900 z-10 text-slate-200 font-bold uppercase tracking-wider text-\[10px\]/g, 'sticky top-0 bg-slate-900 z-10 text-white font-bold uppercase tracking-wider text-[10px]');
content = content.replace(/text-slate-200 font-bold uppercase tracking-wider/g, 'text-white font-bold uppercase tracking-wider');

fs.writeFileSync('components/NotesView.tsx', content);
