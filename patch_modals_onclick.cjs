const fs = require('fs');

function addOnClickToBackdrop(file, closeFn) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /<div className="fixed inset-0([^>]*?)"(?! onClick)>/,
    `<div className="fixed inset-0$1" onClick={${closeFn}}>`
  );
  // Also make sure inner modal stops propagation
  content = content.replace(
    /<div className="(bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md[^>]*?)"(?! onClick)>/,
    `<div className="$1" onClick={(e) => e.stopPropagation()}>`
  );
  fs.writeFileSync(file, content);
}

addOnClickToBackdrop('components/ConfirmModal.tsx', 'onCancel');
addOnClickToBackdrop('components/DuplicateModal.tsx', 'onCancel');
addOnClickToBackdrop('components/LogoEditModal.tsx', 'onClose');

