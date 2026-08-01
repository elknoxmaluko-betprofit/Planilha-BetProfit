const fs = require('fs');
let content = fs.readFileSync('components/TeamsView.tsx', 'utf8');

const importStatement = `import LogoEditModal from './LogoEditModal';\nimport CategoryDetailsModal from './CategoryDetailsModal';`;
content = content.replace("import LogoEditModal from './LogoEditModal';", importStatement);

const stateStatements = `const TeamsView: React.FC<TeamsViewProps> = ({ bets, availableTeams, currency }) => {
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);`;
content = content.replace("const TeamsView: React.FC<TeamsViewProps> = ({ bets, availableTeams, currency }) => {", stateStatements);

const cardClick = `              <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden shadow-sm">`;
const newCardClick = `              <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-sm cursor-pointer" onClick={(e) => {
                if ((e.target as HTMLElement).closest('.group\\\\/badge')) return;
                setViewingCategory(name);
              }}>`;
content = content.replace(cardClick, newCardClick);

const returnEnd = `      </div>
    </div>
  );
};`;
const newReturnEnd = `      </div>
      {viewingCategory && (
        <CategoryDetailsModal
          title={viewingCategory}
          icon="fa-users"
          bets={bets.filter(bet => {
            const parts = bet.event.split(/\\s+(?:vs|v|@|-|(?<!\\d)\\/(?!\\d))\\s+/i).map(p => p.trim().toLowerCase());
            return parts.includes(viewingCategory.toLowerCase()) || bet.team === viewingCategory;
          })}
          currency={currency}
          onClose={() => setViewingCategory(null)}
        />
      )}
    </div>
  );
};`;
content = content.replace(returnEnd, newReturnEnd);

fs.writeFileSync('components/TeamsView.tsx', content);
