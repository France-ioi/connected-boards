
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, confirmLabel, onConfirm, onCancel }) => {
  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-xl font-black text-white tracking-tight mb-2 uppercase">{title}</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>

        <div className="p-8 pt-6 space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
            {confirmLabel}
          </button>
          
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-sm rounded-2xl transition-all active:scale-95"
          >
            CANCEL
          </button>
        </div>
        
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-600 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
