const fs = require('fs');
let content = fs.readFileSync('components/MethodologiesView.tsx', 'utf8');

content = content.replace("import MethodologyDetailsModal from './MethodologyDetailsModal';", "import CategoryDetailsModal from './CategoryDetailsModal';");

const oldModalRender = `<MethodologyDetailsModal
          methodology={viewingMethodology}
          bets={bets}
          currency={currency}
          onClose={() => setViewingMethodology(null)}
        />`;

const newModalRender = `<CategoryDetailsModal
          title={viewingMethodology}
          icon="fa-flask"
          bets={bets.filter(b => (b.methodology || 'Sem Método') === viewingMethodology)}
          currency={currency}
          onClose={() => setViewingMethodology(null)}
        />`;

content = content.replace(oldModalRender, newModalRender);

fs.writeFileSync('components/MethodologiesView.tsx', content);
