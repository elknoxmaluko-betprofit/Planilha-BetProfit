const fs = require('fs');
let content = fs.readFileSync('components/LeaguesView.tsx', 'utf8');

const importStatement = `import ConfirmModal from './ConfirmModal';\nimport CategoryDetailsModal from './CategoryDetailsModal';`;
content = content.replace("import ConfirmModal from './ConfirmModal';", importStatement);

const stateStatements = `  const [deletingName, setDeletingName] = useState<string | null>(null);\n  const [viewingCategory, setViewingCategory] = useState<string | null>(null);`;
content = content.replace("  const [deletingName, setDeletingName] = useState<string | null>(null);", stateStatements);

const cardClick = `            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">`;
const newCardClick = `            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-sm cursor-pointer" onClick={(e) => {
              if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('form') || (e.target as HTMLElement).closest('.group\\\\/badge')) return;
              setViewingCategory(name);
            }}>`;
content = content.replace(cardClick, newCardClick);

const modalRender = `      <ConfirmModal`;
const newModalRender = `      {viewingCategory && (
        <CategoryDetailsModal
          title={viewingCategory}
          icon="fa-trophy"
          bets={bets.filter(b => (b.league || 'Sem Campeonato') === viewingCategory)}
          currency={currency}
          onClose={() => setViewingCategory(null)}
        />
      )}
      <ConfirmModal`;
content = content.replace(modalRender, newModalRender);

fs.writeFileSync('components/LeaguesView.tsx', content);
