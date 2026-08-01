const fs = require('fs');

// ConfirmModal
let confirmContent = fs.readFileSync('components/ConfirmModal.tsx', 'utf8');
confirmContent = confirmContent.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black\/80 backdrop-blur-sm">/g,
  '<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onCancel}>'
);
confirmContent = confirmContent.replace(
  /<div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">/g,
  '<div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>'
);
fs.writeFileSync('components/ConfirmModal.tsx', confirmContent);

// LogoEditModal
let logoContent = fs.readFileSync('components/LogoEditModal.tsx', 'utf8');
logoContent = logoContent.replace(
  /<div className="fixed inset-0 bg-black\/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">/g,
  '<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>'
);
logoContent = logoContent.replace(
  /<div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">/g,
  '<div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>'
);
fs.writeFileSync('components/LogoEditModal.tsx', logoContent);

