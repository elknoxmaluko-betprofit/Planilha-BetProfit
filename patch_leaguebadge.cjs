const fs = require('fs');
let content = fs.readFileSync('components/LeaguesView.tsx', 'utf8');

content = content.replace(
  /const LeagueBadge: React.FC<\{ leagueName: string \}> = \(\{ leagueName \}\) => \{/,
  'export const LeagueBadge: React.FC<{ leagueName: string; size?: "sm" | "md"; editable?: boolean }> = ({ leagueName, size = "md", editable = true }) => {'
);

const oldRenderContentStart = `  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-20 h-20 rounded-2xl bg-slate-800/80 animate-pulse border border-slate-700/50 flex items-center justify-center shadow-inner">
          <i className="fas fa-circle-notch fa-spin text-slate-600 text-lg"></i>
        </div>
      );
    }
    if (error || !logoUrl) {
      const words = leagueName.trim().split(/\\s+/);
      let initials = '';
      if (words.length === 1) {
        initials = words[0].substring(0, 3).toUpperCase();
      } else if (words.length === 2 && !isNaN(Number(words[1]))) {
        initials = words[0].substring(0, 3).toUpperCase() + words[1];
      } else {
        initials = words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
      }
      return (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex flex-col items-center justify-center text-slate-400 shadow-md group-hover/badge:border-slate-500 transition-colors">
          <i className="fas fa-trophy text-xl text-yellow-500/80 mb-1"></i>
          <span className="text-xs font-black tracking-tighter text-slate-300 leading-none">{initials}</span>
        </div>
      );
    }
    return (
      <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-slate-700/60 p-2 flex items-center justify-center shadow-md overflow-hidden group-hover/badge:border-slate-500 transition-all">`;

const newRenderContentStart = `  const renderContent = () => {
    const boxSize = size === 'sm' ? 'w-9 h-9 rounded-xl' : 'w-20 h-20 rounded-2xl';
    if (loading) {
      return (
        <div className={\`\${boxSize} bg-slate-800/80 animate-pulse border border-slate-700/50 flex items-center justify-center shadow-inner\`}>
          <i className={\`fas fa-circle-notch fa-spin text-slate-600 \${size === 'sm' ? 'text-xs' : 'text-lg'}\`}></i>
        </div>
      );
    }
    if (error || !logoUrl) {
      const words = leagueName.trim().split(/\\s+/);
      let initials = '';
      if (words.length === 1) {
        initials = words[0].substring(0, 3).toUpperCase();
      } else if (words.length === 2 && !isNaN(Number(words[1]))) {
        initials = words[0].substring(0, 3).toUpperCase() + words[1];
      } else {
        initials = words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
      }
      return (
        <div className={\`\${boxSize} bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex flex-col items-center justify-center text-slate-400 shadow-md group-hover/badge:border-slate-500 transition-colors\`}>
          <i className={\`fas fa-trophy text-yellow-500/80 \${size === 'sm' ? 'text-xs mb-0' : 'text-xl mb-1'}\`}></i>
          {size !== 'sm' && <span className="text-xs font-black tracking-tighter text-slate-300 leading-none">{initials}</span>}
        </div>
      );
    }
    return (
      <div className={\`\${boxSize} bg-slate-900/80 border border-slate-700/60 \${size === 'sm' ? 'p-1' : 'p-2'} flex items-center justify-center shadow-md overflow-hidden group-hover/badge:border-slate-500 transition-all\`}>`;

content = content.replace(oldRenderContentStart, newRenderContentStart);

const oldReturn = `  return (
    <>
      <div 
        onClick={() => setIsEditOpen(true)}
        className="relative group/badge cursor-pointer"
        title="Clicar para alterar ou personalizar logotipo"
      >
        {renderContent()}
        <div className="absolute inset-0 rounded-2xl bg-slate-950/70 opacity-0 group-hover/badge:opacity-100 flex flex-col items-center justify-center text-yellow-400 transition-all z-10 backdrop-blur-[1px]">
          <i className="fas fa-camera text-sm mb-0.5"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Editar</span>
        </div>
      </div>
      <LogoEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        entityName={leagueName}
        cacheKey={cacheKey}
        onUpdateLogo={handleUpdateLogo}
      />
    </>
  );`;

const newReturn = `  if (!editable) {
    return renderContent();
  }
  return (
    <>
      <div 
        onClick={() => setIsEditOpen(true)}
        className="relative group/badge cursor-pointer inline-block"
        title="Clicar para alterar ou personalizar logotipo"
      >
        {renderContent()}
        <div className={\`absolute inset-0 \${size === 'sm' ? 'rounded-xl' : 'rounded-2xl'} bg-slate-950/80 opacity-0 group-hover/badge:opacity-100 flex flex-col items-center justify-center text-yellow-400 transition-all z-10 backdrop-blur-[1px]\`}>
          <i className={\`fas fa-camera \${size === 'sm' ? 'text-[10px]' : 'text-sm mb-0.5'}\`}></i>
          {size !== 'sm' && <span className="text-[8px] font-black uppercase tracking-tighter">Editar</span>}
        </div>
      </div>
      <LogoEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        entityName={leagueName}
        cacheKey={cacheKey}
        onUpdateLogo={handleUpdateLogo}
      />
    </>
  );`;

content = content.replace(oldReturn, newReturn);
fs.writeFileSync('components/LeaguesView.tsx', content);
