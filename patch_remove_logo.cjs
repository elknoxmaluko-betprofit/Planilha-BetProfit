const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

const toRemove = `      {/* Mantém o logotipo visível sobre o fundo sombreado */}
      <div className="fixed top-6 left-6 hidden lg:flex items-center gap-3 z-[110] pointer-events-none">
        <Logo size="sm" />
        <h1 className="text-2xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
      </div>`;

content = content.replace(toRemove, '');
fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
