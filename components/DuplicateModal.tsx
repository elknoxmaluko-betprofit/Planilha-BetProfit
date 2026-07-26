import React from 'react';
import { Bet } from '../types';

interface DuplicateModalProps {
  isOpen: boolean;
  newBet: Bet | null;
  existingBet: Bet | null;
  onResolve: (action: 'ADD' | 'REPLACE' | 'IGNORE') => void;
  currency: string;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({ isOpen, newBet, existingBet, onResolve, currency }) => {
  if (!isOpen || !newBet || !existingBet) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-copy text-3xl text-yellow-400"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Aposta Duplicada Detetada!</h3>
        <p className="text-slate-400 mb-6 leading-relaxed">
          Detetámos uma aposta idêntica já registada no sistema. O que pretende fazer?
        </p>

        <div className="bg-slate-800/50 p-4 rounded-2xl mb-8 text-left space-y-2 border border-slate-800 text-sm">
           <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Jogo:</span> <span className="font-bold text-white text-right break-words max-w-[60%]">{newBet.event}</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Mercado:</span> <span className="font-bold text-white">{newBet.market}</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Data:</span> <span className="font-bold text-white">{new Date(newBet.date).toLocaleDateString('pt-PT')}</span></div>
           <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">P/L:</span> <span className={`font-bold font-mono ${newBet.profit > 0 ? 'text-emerald-400' : newBet.profit < 0 ? 'text-red-400' : 'text-slate-400'}`}>{newBet.profit > 0 ? '+' : ''}{newBet.profit.toFixed(2)}{currency}</span></div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onResolve('ADD')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-left flex items-center justify-between group"
          >
            <span><i className="fas fa-plus mr-2 text-emerald-400"></i> Adicionar nova aposta</span>
            <i className="fas fa-chevron-right opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"></i>
          </button>
          <button 
            onClick={() => onResolve('REPLACE')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-left flex items-center justify-between group"
          >
            <span><i className="fas fa-sync-alt mr-2 text-yellow-400"></i> Substituir aposta existente</span>
            <i className="fas fa-chevron-right opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"></i>
          </button>
          <button 
            onClick={() => onResolve('IGNORE')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold py-3 px-4 rounded-xl transition-colors text-left flex items-center justify-between group"
          >
            <span><i className="fas fa-times mr-2 text-red-400"></i> Ignorar nova aposta</span>
            <i className="fas fa-chevron-right opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;
