import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface LogoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  cacheKey: string;
  onUpdateLogo: (newUrl: string | null) => void;
}

const LogoEditModal: React.FC<LogoEditModalProps> = ({
  isOpen,
  onClose,
  entityName,
  cacheKey,
  onUpdateLogo
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Redimensionar e comprimir imagem em Canvas para poupar espaço no localStorage (máx ~50KB)
  const resizeImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 180; // Tamanho ideal para emblemas nítidos e leves
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            // Exportar como PNG transparente ou WebP
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject(new Error('Falha no canvas'));
          }
        };
        img.onerror = () => reject(new Error('Ficheiro de imagem inválido'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler ficheiro'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      const base64Logo = await resizeImageFile(file);
      localStorage.setItem(cacheKey, base64Logo);
      onUpdateLogo(base64Logo);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar imagem.');
      setLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    localStorage.setItem(cacheKey, imageUrl.trim());
    onUpdateLogo(imageUrl.trim());
    onClose();
  };

  const handleResetAuto = () => {
    localStorage.removeItem(cacheKey);
    onUpdateLogo(null); // Forçar nova pesquisa automática
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <i className="fas fa-image text-lg"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Logotipo Personalizado</h3>
              <p className="text-slate-400 text-xs truncate max-w-[200px]">{entityName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Opção 1: Carregar do Computador */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            1. Carregar imagem do computador (Recomendado)
          </label>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-yellow-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin text-lg"></i>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-lg"></i>
                <span>Escolher Ficheiro (PNG, JPG, WebP)</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-500 mt-1.5 text-center">
            A imagem é redimensionada automaticamente para caber perfeitamente no cartão.
          </p>
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative px-3 bg-slate-900 text-xs text-slate-500 uppercase tracking-widest font-bold">ou</span>
        </div>

        {/* Opção 2: Colar Link URL */}
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            2. Colar Link direto de uma imagem (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://exemplo.com/logo.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500"
            />
            <button
              type="submit"
              disabled={!imageUrl.trim()}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Aplicar</span>
            </button>
          </div>
        </form>

        {/* Opção 3: Reset para Pesquisa Automática */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={handleResetAuto}
            className="text-xs text-slate-400 hover:text-yellow-400 transition-colors underline decoration-slate-700 hover:decoration-yellow-400 underline-offset-4 flex items-center gap-1.5"
          >
            <i className="fas fa-magic text-[10px]"></i>
            <span>Repor pesquisa automática</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoEditModal;
