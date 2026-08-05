const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /<div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">[\s\S]*?<\/div>/;

const newMenu = `<div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">
          <button onClick={() => handleViewChange('dashboard')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'dashboard' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-chart-pie w-6"></i> Dashboard
          </button>
          <button onClick={() => handleViewChange('bets')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'bets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-list w-6"></i> Histórico
          </button>
          <button onClick={() => handleViewChange('markets')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'markets' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-bullseye w-6"></i> Mercados
          </button>
          <button onClick={() => handleViewChange('leagues')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'leagues' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-trophy w-6"></i> Campeonatos
          </button>
          <button onClick={() => handleViewChange('teams')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'teams' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-users w-6"></i> Equipas
          </button>
          <button onClick={() => handleViewChange('methodologies')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'methodologies' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-flask w-6"></i> Métodos
          </button>
          <button onClick={() => handleViewChange('tags')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'tags' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-tags w-6"></i> Tags
          </button>
          <button onClick={() => handleViewChange('projects')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'projects' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-folder-open w-6"></i> Projetos
          </button>
          <button onClick={() => handleViewChange('annual')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'annual' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-calendar w-6"></i> Anual
          </button>
          <button onClick={() => handleViewChange('add')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'add' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-plus-circle w-6"></i> Registar
          </button>
          <button onClick={() => handleViewChange('ladder')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'ladder' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-layer-group w-6"></i> Ladder
          </button>
          <button onClick={() => handleViewChange('data')} className={\`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-lg \${view === 'data' ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
            <i className="fas fa-database w-6"></i> Dados
          </button>
        </div>`;

content = content.replace(regex, newMenu);
fs.writeFileSync('App.tsx', content);
