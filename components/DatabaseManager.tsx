
import React, { useRef, useState } from 'react';

interface DatabaseManagerProps {
  onDataImport: (data: any) => void;
  currentData: {
    bets: any[];
    monthlyStakes: any;
    monthlyBankrolls: any;
    methodologies: string[];
    tags: string[];
  };
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onDataImport, currentData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [importCandidate, setImportCandidate] = useState<any>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `betprofit_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Validação básica
        if (json.bets && Array.isArray(json.bets)) {
          setImportCandidate(json);
          setShowConfirm(true);
        } else {
          alert('Ficheiro inválido. Certifique-se que é um backup do BetProfit.');
        }
      } catch (err) {
        alert('Erro ao ler o ficheiro.');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (importCandidate) {
      onDataImport(importCandidate);
      setShowConfirm(false);
      setImportCandidate(null);
      alert('Dados importados com sucesso!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <i className="fas fa-share-alt text-yellow-400"></i> Partilhar e Backup
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Como o BetProfit guarda os dados localmente por privacidade, use esta ferramenta para partilhar o seu progresso com amigos ou para mudar de dispositivo.
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handleExport}
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-download"></i> Exportar Dados
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-upload"></i> Importar Dados
            </button>
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileChange} 
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
             <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-widest">Registos Atuais</p>
             <p className="text-2xl font-bold text-white">{currentData.bets.length}</p>
          </div>
          <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
             <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-widest">Metodologias</p>
             <p className="text-2xl font-bold text-white">{currentData.methodologies.length}</p>
          </div>
          <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800">
             <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-widest">Tags de Análise</p>
             <p className="text-2xl font-bold text-white">{currentData.tags.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl">
        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle"></i> Como partilhar com amigos?
        </h4>
        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
          <li>Clique em <b>Exportar</b> para descarregar o ficheiro .json com os seus dados.</li>
          <li>Envie este ficheiro ao seu amigo (via WhatsApp, E-mail, etc.).</li>
          <li>O seu amigo abre o BetProfit e clica em <b>Importar</b> para ver exatamente o que você vê.</li>
        </ul>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 text-2xl mx-auto mb-6">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-4">Confirmar Importação?</h3>
            <p className="text-slate-400 text-center mb-8 leading-relaxed">
              Atenção: Importar novos dados irá <span className="text-red-400 font-bold">apagar permanentemente</span> todos os seus registos atuais neste navegador. Deseja continuar?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-4 font-bold text-slate-500 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmImport}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-500/10 transition-all active:scale-95"
              >
                Sim, Substituir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;
