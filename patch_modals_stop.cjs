const fs = require('fs');

function stopProp(file, searchStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    new RegExp(`<div className="${searchStr}"(?! onClick)>`),
    `<div className="${searchStr}" onClick={(e) => e.stopPropagation()}>`
  );
  fs.writeFileSync(file, content);
}

stopProp('components/ConfirmModal.tsx', 'bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 text-center');
stopProp('components/DuplicateModal.tsx', 'bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200 text-center');
stopProp('components/LogoEditModal.tsx', 'bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden');

