const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const ladderBtn = `<button onClick={() => handleViewChange('ladder')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'ladder' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-layer-group w-6"></i> Ladder
          </button>`;

const addBtn = `<button onClick={() => handleViewChange('add')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'add' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-plus-circle w-6"></i> Registar
          </button>`;

if (content.includes(ladderBtn)) {
    // Remove ladderBtn from its current place
    content = content.replace(ladderBtn + '\\n', ''); // Try with newline
    content = content.replace(ladderBtn, ''); // Fallback
    
    // Insert after addBtn
    content = content.replace(addBtn, addBtn + '\\n          ' + ladderBtn);
    
    fs.writeFileSync('App.tsx', content);
    console.log("Patched menu");
} else {
    console.log("Could not find ladderBtn");
}

