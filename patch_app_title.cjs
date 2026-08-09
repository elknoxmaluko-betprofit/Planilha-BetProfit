const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(
  /\{view === 'dashboard' \? 'Visão Geral' : view === 'annual' \? 'Visão Anual' : view === 'bets' \? 'Histórico' : view === 'markets' \? 'Análise de Mercados' : view === 'methodologies' \? 'Gestão de Métodos' : view === 'tags' \? 'Análise por Tags' : view === 'leagues' \? 'Campeonatos' : view === 'teams' \? 'Equipas' : view === 'projects' \? 'Gestão de Projetos' : view === 'ladder' \? 'Ladder Trading' : view === 'data' \? 'Base de Dados' : 'Nova Entrada'\}/,
  "{view === 'dashboard' ? 'Visão Geral' : view === 'annual' ? 'Visão Anual' : view === 'bets' ? 'Histórico' : view === 'notes' ? 'Anotações' : view === 'markets' ? 'Análise de Mercados' : view === 'methodologies' ? 'Gestão de Métodos' : view === 'tags' ? 'Análise por Tags' : view === 'leagues' ? 'Campeonatos' : view === 'teams' ? 'Equipas' : view === 'projects' ? 'Gestão de Projetos' : view === 'ladder' ? 'Ladder Trading' : view === 'data' ? 'Base de Dados' : 'Nova Entrada'}"
);

fs.writeFileSync('App.tsx', content);
