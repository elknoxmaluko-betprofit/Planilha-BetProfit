const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const buttonRegex = /<div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">([\s\S]*?)<\/div>\s*<div className="mt-auto/;

const navContent = content.match(buttonRegex);
if (!navContent) {
  console.log("Could not find button container");
  process.exit(1);
}

const newNavButtons = `
          <button onClick={() => handleViewChange('dashboard')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'dashboard' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-chart-pie w-6"></i> Dashboard
          </button>
          <button onClick={() => handleViewChange('bets')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'bets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-list w-6"></i> Histórico
          </button>
          <button onClick={() => handleViewChange('notes')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'notes' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-edit w-6"></i> Anotações
          </button>
          
          {/* Menu Anual com Sub-menus */}
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                handleViewChange('annual');
                setIsAnnualMenuOpen(!isAnnualMenuOpen);
              }} 
              className={\`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-lg \${view === 'annual' || ['markets', 'leagues', 'teams', 'methodologies', 'tags'].includes(view) ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-calendar w-6"></i> Anual
              </div>
              <i className={\`fas fa-chevron-\${isAnnualMenuOpen ? 'up' : 'down'} text-sm opacity-70\`}></i>
            </button>
            
            {isAnnualMenuOpen && (
              <div className="flex flex-col gap-1 ml-6 pl-4 border-l-2 border-slate-800/50 mt-1 mb-2">
                <button onClick={() => handleViewChange('markets')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'markets' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-bullseye w-5"></i> Mercados
                </button>
                <button onClick={() => handleViewChange('leagues')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'leagues' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-trophy w-5"></i> Campeonatos
                </button>
                <button onClick={() => handleViewChange('teams')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'teams' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-users w-5"></i> Equipas
                </button>
                <button onClick={() => handleViewChange('methodologies')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'methodologies' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-flask w-5"></i> Métodos
                </button>
                <button onClick={() => handleViewChange('tags')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'tags' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-tags w-5"></i> Tags
                </button>
              </div>
            )}
          </div>

          <button onClick={() => handleViewChange('projects')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'projects' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-folder-open w-6"></i> Projetos
          </button>
          <button onClick={() => handleViewChange('add')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'add' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-plus-circle w-6"></i> Nova Entrada
          </button>
          <button onClick={() => handleViewChange('ladder')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'ladder' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-layer-group w-6"></i> Ladder
          </button>
          <button onClick={() => handleViewChange('data')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'data' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-database w-6"></i> Dados
          </button>
`;

content = content.replace(buttonRegex, '<div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">\n' + newNavButtons + '\n        </div>\n        <div className="mt-auto');
fs.writeFileSync('App.tsx', content);
