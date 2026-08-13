const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// 1. Update the view type
content = content.replace(
  "useState<'dashboard' | 'annual' | 'bets' | 'notes' | 'add' | 'markets' | 'methodologies' | 'tags' | 'leagues' | 'teams' | 'projects' | 'data' | 'ladder'>",
  "useState<'dashboard' | 'annual' | 'bets' | 'notes' | 'add' | 'markets' | 'methodologies' | 'tags' | 'leagues' | 'teams' | 'projects' | 'data' | 'ladder' | 'annual_markets' | 'annual_methodologies' | 'annual_tags' | 'annual_leagues' | 'annual_teams'>"
);

// 2. Add isAnnualMenuOpen state if not exists
if (!content.includes('const [isAnnualMenuOpen')) {
  content = content.replace(
    "const [hideStake, setHideStake] = useState(() => {",
    "const [isAnnualMenuOpen, setIsAnnualMenuOpen] = useState(false);\n  const [hideStake, setHideStake] = useState(() => {"
  );
}

// 3. Update the Title mapping
content = content.replace(
  "{view === 'dashboard' ? 'Visão Geral' : view === 'annual' ? 'Visão Anual' : view === 'bets' ? 'Histórico' : view === 'notes' ? 'Anotações' : view === 'markets' ? 'Análise de Mercados' : view === 'methodologies' ? 'Gestão de Métodos' : view === 'tags' ? 'Análise por Tags' : view === 'leagues' ? 'Campeonatos' : view === 'teams' ? 'Equipas' : view === 'projects' ? 'Gestão de Projetos' : view === 'ladder' ? 'Ladder Trading' : view === 'data' ? 'Base de Dados' : 'Nova Entrada'}",
  "{view === 'dashboard' ? 'Visão Geral' : view === 'annual' ? 'Visão Anual' : view === 'bets' ? 'Histórico' : view === 'notes' ? 'Anotações' : view === 'markets' ? 'Análise de Mercados' : view === 'methodologies' ? 'Gestão de Métodos' : view === 'tags' ? 'Análise por Tags' : view === 'leagues' ? 'Campeonatos' : view === 'teams' ? 'Equipas' : view === 'projects' ? 'Gestão de Projetos' : view === 'ladder' ? 'Ladder Trading' : view === 'data' : view.startsWith('annual_') ? (view.replace('annual_', '') === 'markets' ? 'Análise de Mercados (Anual)' : view.replace('annual_', '') === 'methodologies' ? 'Gestão de Métodos (Anual)' : view.replace('annual_', '') === 'tags' ? 'Análise por Tags (Anual)' : view.replace('annual_', '') === 'leagues' ? 'Campeonatos (Anual)' : 'Equipas (Anual)') : 'Nova Entrada'}"
);

// 4. Also update the subtitle rendering:
content = content.replace(
  "{view !== 'ladder' && <p className=\"text-slate-400 text-lg mt-1\">{view === 'annual' ? `Ano de ${selectedDate.year}` : `${months[selectedDate.month]} ${selectedDate.year}`}</p>}",
  "{view !== 'ladder' && <p className=\"text-slate-400 text-lg mt-1\">{view === 'annual' || view.startsWith('annual_') ? `Ano de ${selectedDate.year}` : `${months[selectedDate.month]} ${selectedDate.year}`}</p>}"
);

// 5. Build the new sidebar nav.
// The user wants original items AND annual items.
const buttonRegex = /<div className="space-y-2 overflow-y-auto flex-1 scrollbar-none">([\s\S]*?)<\/div>\s*<div className="mt-auto/;

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

          {/* Menu Anual com Sub-menus */}
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                handleViewChange('annual');
                setIsAnnualMenuOpen(!isAnnualMenuOpen);
              }} 
              className={\`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-lg \${view === 'annual' || view.startsWith('annual_') ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg shadow-yellow-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}
            >
              <div className="flex items-center gap-4">
                <i className="fas fa-calendar w-6"></i> Anual
              </div>
              <i className={\`fas fa-chevron-\${isAnnualMenuOpen ? 'up' : 'down'} text-sm opacity-70\`}></i>
            </button>
            
            {isAnnualMenuOpen && (
              <div className="flex flex-col gap-1 ml-6 pl-4 border-l-2 border-slate-800/50 mt-1 mb-2">
                <button onClick={() => handleViewChange('annual_markets')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'annual_markets' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-bullseye w-5"></i> Mercados
                </button>
                <button onClick={() => handleViewChange('annual_leagues')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'annual_leagues' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-trophy w-5"></i> Campeonatos
                </button>
                <button onClick={() => handleViewChange('annual_teams')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'annual_teams' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-users w-5"></i> Equipas
                </button>
                <button onClick={() => handleViewChange('annual_methodologies')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'annual_methodologies' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
                  <i className="fas fa-flask w-5"></i> Métodos
                </button>
                <button onClick={() => handleViewChange('annual_tags')} className={\`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-base \${view === 'annual_tags' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}\`}>
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


// 6. Update rendering logic
const renderViewsRegex = /\{view === 'markets' && <MarketsView[\s\S]*?\{view === 'tags' && <TagsView.*? currency=\{currency\} \/>\}/;

const renderViewsCode = `
        {view === 'markets' && <MarketsView monthlyStake={currentMonthlyStake} bets={filteredBets} currency={currency} />}
        {view === 'leagues' && <LeaguesView monthlyStake={currentMonthlyStake} bets={filteredBets} available={leaguesList} onCreate={(l) => handleUpdateList('leagues', [...leaguesList, l])} onDelete={(l) => handleUpdateList('leagues', leaguesList.filter(x => x !== l))} onEdit={(oldName, newName) => handleRenameListItem('leagues', oldName, newName)} currency={currency} />}
        {view === 'teams' && <TeamsView monthlyStake={currentMonthlyStake} bets={filteredBets} availableTeams={teamsList} currency={currency} />}
        {view === 'methodologies' && <MethodologiesView monthlyStake={currentMonthlyStake} bets={filteredBets} available={methodologiesList} onCreate={(m) => handleUpdateList('methodologies', [...methodologiesList, m])} onDelete={(m) => handleUpdateList('methodologies', methodologiesList.filter(x => x !== m))} onEdit={(oldName, newName) => handleRenameListItem('methodologies', oldName, newName)} currency={currency} />}
        {view === 'tags' && <TagsView monthlyStake={currentMonthlyStake} bets={filteredBets} available={tagsList} onCreate={(t) => handleUpdateList('tags', [...tagsList, t])} onDelete={(t) => handleUpdateList('tags', tagsList.filter(x => x !== t))} onEdit={(oldName, newName) => handleRenameListItem('tags', oldName, newName)} currency={currency} />}

        {/* ANNUAL VIEWS */}
        {view === 'annual_markets' && <MarketsView monthlyStake={currentMonthlyStake} bets={annualBets} currency={currency} />}
        {view === 'annual_leagues' && <LeaguesView monthlyStake={currentMonthlyStake} bets={annualBets} available={leaguesList} onCreate={(l) => handleUpdateList('leagues', [...leaguesList, l])} onDelete={(l) => handleUpdateList('leagues', leaguesList.filter(x => x !== l))} onEdit={(oldName, newName) => handleRenameListItem('leagues', oldName, newName)} currency={currency} />}
        {view === 'annual_teams' && <TeamsView monthlyStake={currentMonthlyStake} bets={annualBets} availableTeams={teamsList} currency={currency} />}
        {view === 'annual_methodologies' && <MethodologiesView monthlyStake={currentMonthlyStake} bets={annualBets} available={methodologiesList} onCreate={(m) => handleUpdateList('methodologies', [...methodologiesList, m])} onDelete={(m) => handleUpdateList('methodologies', methodologiesList.filter(x => x !== m))} onEdit={(oldName, newName) => handleRenameListItem('methodologies', oldName, newName)} currency={currency} />}
        {view === 'annual_tags' && <TagsView monthlyStake={currentMonthlyStake} bets={annualBets} available={tagsList} onCreate={(t) => handleUpdateList('tags', [...tagsList, t])} onDelete={(t) => handleUpdateList('tags', tagsList.filter(x => x !== t))} onEdit={(oldName, newName) => handleRenameListItem('tags', oldName, newName)} currency={currency} />}`;

content = content.replace(renderViewsRegex, renderViewsCode.trim());

// 7. Update the controls visibility for annual views
content = content.replace(
  "{view !== 'annual' && view !== 'projects' && view !== 'ladder' && (",
  "{view !== 'annual' && !view.startsWith('annual_') && view !== 'projects' && view !== 'ladder' && ("
);

content = content.replace(
  "{view !== 'annual' && (",
  "{view !== 'annual' && !view.startsWith('annual_') && ("
);

fs.writeFileSync('App.tsx', content);
