const fs = require('fs');
let content = fs.readFileSync('components/NotesView.tsx', 'utf8');

const importReplacement = `import React, { useMemo, useState } from 'react';
import { Bet } from '../types';

interface NotesViewProps {
  bets: Bet[];
  onUpdateBet: (id: string, updates: Partial<Bet>) => void;
  currency: string;
  availableTags: string[];
}`;

content = content.replace(
  /import React, \{ useMemo \} from 'react';\nimport \{ Bet \} from '\.\.\/types';\n\ninterface NotesViewProps \{\n  bets: Bet\[\];\n  onUpdateBet: \(id: string, updates: Partial<Bet>\) => void;\n  currency: string;\n\}/,
  importReplacement
);

const stateReplacement = `const NotesView: React.FC<NotesViewProps> = ({ bets, onUpdateBet, currency, availableTags }) => {
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Sort bets by date descending and filter by tag
  const sortedBets = useMemo(() => {
    let filtered = bets;
    if (selectedTag) {
      filtered = bets.filter(bet => bet.tags && bet.tags.includes(selectedTag));
    }
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bets, selectedTag]);`;

content = content.replace(
  /const NotesView: React\.FC<NotesViewProps> = \(\{ bets, onUpdateBet, currency \}\) => \{\n  \/\/ Sort bets by date descending\n  const sortedBets = useMemo\(\(\) => \{\n    return \[\.\.\.bets\]\.sort\(\(a, b\) => new Date\(b\.date\)\.getTime\(\) - new Date\(a\.date\)\.getTime\(\)\);\n  \}, \[bets\]\);/,
  stateReplacement
);

const headerReplacement = `  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col bg-black text-xs font-sans border-t border-slate-800">
      
      {/* Filters */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-tag text-slate-400"></i>
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">Filtrar por Tag:</span>
          <select 
            value={selectedTag} 
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-800 text-white p-2 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400/50 min-w-[200px]"
          >
            <option value="">Todas as Anotações</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">`;

content = content.replace(
  /  return \(\n    <div className="w-full h-\[calc\(100vh-100px\)\] flex flex-col bg-black text-xs font-sans border-t border-slate-800">\n      <div className="flex-1 overflow-auto">/,
  headerReplacement
);

fs.writeFileSync('components/NotesView.tsx', content);
