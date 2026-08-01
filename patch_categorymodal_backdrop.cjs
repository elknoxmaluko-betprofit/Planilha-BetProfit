const fs = require('fs');
let content = fs.readFileSync('components/CategoryDetailsModal.tsx', 'utf8');

// Ensure Logo is imported
if (!content.includes("import Logo from './Logo';")) {
  content = content.replace(
    /import \{ LeagueBadge \} from '\.\/LeaguesView';/,
    "import { LeagueBadge } from './LeaguesView';\nimport Logo from './Logo';"
  );
}

// Update backdrop and modal container
const oldBackdrop = '<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">';
const newBackdrop = `<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Mantém o logotipo visível sobre o fundo sombreado */}
      <div className="fixed top-6 left-6 hidden lg:flex items-center gap-3 z-[110] pointer-events-none">
        <Logo size="lg" />
        <h1 className="text-2xl font-bold tracking-tight text-white">Bet<span className="text-yellow-400">Profit</span></h1>
      </div>`;
content = content.replace(oldBackdrop, newBackdrop);

const oldModalContent = '<div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">';
const newModalContent = '<div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>';
content = content.replace(oldModalContent, newModalContent);

fs.writeFileSync('components/CategoryDetailsModal.tsx', content);
