import React from 'react';
import { Save, FolderOpen, X, Download, Upload, Info } from 'lucide-react';
import { AppMode } from '../types';

interface LibraryPanelProps {
  onSave: () => void;
  onLoad: () => void;
  onClose: () => void;
  partCount: number;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ onSave, onLoad, onClose, partCount }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
              <FolderOpen className="text-amber-400" size={28} />
              Machine <span className="text-amber-400">Library</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">Manage your blueprints and saved configurations</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Save Section */}
            <button 
              onClick={onSave}
              className="group relative flex flex-col items-center justify-center p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] hover:bg-blue-600/20 hover:border-blue-500/40 transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform">
                <Download size={32} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Save Machine</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Export to Local Storage</p>
              
              {partCount === 0 && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-black text-white uppercase px-4 text-center">No parts to save</p>
                </div>
              )}
            </button>

            {/* Load Section */}
            <button 
              onClick={onLoad}
              className="group flex flex-col items-center justify-center p-8 bg-amber-600/10 border border-amber-500/20 rounded-[2rem] hover:bg-amber-600/20 hover:border-amber-500/40 transition-all duration-300 active:scale-95"
            >
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-amber-600/30 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Load Machine</h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-1">Restore Last Blueprint</p>
            </button>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 flex items-start gap-4 border border-white/5">
            <div className="p-2 bg-white/5 rounded-xl text-slate-400">
              <Info size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Blueprint Information</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Current assembly contains <span className="text-blue-400 font-bold">{partCount} components</span>. 
                Machine Crafter currently uses browser local storage for persistence. Clearing your browser data will erase your saved blueprints.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white/5 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95"
          >
            RETURN TO BUILDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryPanel;