const fs = require('fs');
let content = fs.readFileSync('components/NotesView.tsx', 'utf8');

// Replace bg-black, bg-[#0a0a0a], text-white with slate variants
content = content.replace(/bg-black/g, 'bg-slate-900');
content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-slate-900');
content = content.replace(/bg-\[#111\]/g, 'bg-slate-800/50');
content = content.replace(/focus:bg-\[#222\]/g, 'focus:bg-slate-800');
content = content.replace(/border-slate-600/g, 'border-slate-700');
content = content.replace(/text-white/g, 'text-slate-200');

fs.writeFileSync('components/NotesView.tsx', content);
