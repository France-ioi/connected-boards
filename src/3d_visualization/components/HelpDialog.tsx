
import React from 'react';
import { X, Hammer, Trash2, Settings, Play, Undo2, ChevronUp, ChevronDown, RotateCw, Palette, MousePointer2, Move } from 'lucide-react';

interface HelpDialogProps {
  onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">OPERATIONS <span className="text-blue-500">MANUAL</span></h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">Technical guide for the 3D Machine Crafter</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <div className="w-1 h-3 bg-blue-500 rounded-full" />
              Build Mode Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KeyDetail 
                keyCap="X / Y / Z" 
                title="Rotate Axis" 
                description="Rotates the selected ghost part by 90 degrees around the chosen global axis before placement." 
              />
              <KeyDetail 
                keyCap="PageUp / Dn" 
                title="Shift Machine" 
                description="Moves the entire assembly one grid unit up or down. Useful for ground clearance or taller builds." 
              />
              <KeyDetail 
                keyCap="Backspace" 
                title="Undo Action" 
                description="Reverts the last change made to the machine. Supports up to 20 steps of construction history." 
              />
              <KeyDetail 
                keyCap="Arrows" 
                title="Pan Camera" 
                description="Shifts the camera focus point horizontally. Combined with mouse-drag (Rotate), it allows full navigation." 
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              Play Mode Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KeyDetail 
                keyCap="W / S" 
                title="Default Motor" 
                description="Controls bound motors. In Momentary mode, hold to spin. In Cruise mode, tap to increase/decrease velocity." 
              />
              <KeyDetail 
                keyCap="Mouse Drag" 
                title="Physics Interaction" 
                description="Use the selected tool (Push, Drag, Kick) to interact with your machine while the simulation is running." 
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <div className="w-1 h-3 bg-slate-400 rounded-full" />
              Interface Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HelpItem 
                icon={<Hammer size={18} />} 
                title="Build Tool" 
                description="Standard assembly mode. Click surfaces to attach parts from the inventory." 
              />
              <HelpItem 
                icon={<Trash2 size={18} />} 
                title="Eraser Tool" 
                description="Removes components. Essential for pruning excess parts or fixing errors." 
              />
              <HelpItem 
                icon={<Palette size={18} />} 
                title="Paint Shop" 
                description="Applies custom colors and finishes. Change look without affecting function." 
              />
              <HelpItem 
                icon={<Settings size={18} />} 
                title="Config Tool" 
                description="Opens settings for smart parts like Motors. Bind keys and set speeds here." 
              />
            </div>
          </section>

          <section className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 flex gap-4 items-start">
             <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
               <MousePointer2 size={24} />
             </div>
             <div>
                <h3 className="text-sm font-black text-blue-400 mb-1">Center of Mass Tip</h3>
                <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
                  If your vehicle keeps flipping over, use <span className="text-blue-400 font-bold">Heavy Blocks</span> (Stabilizers) at the very bottom of the chassis. A lower center of mass ensures stability during high-speed turns.
                </p>
             </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white/5 text-center flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Version 1.0.4 r-alpha</p>
          <button 
            onClick={onClose}
            className="px-12 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            DISMISS MANUAL
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const HelpItem = ({ icon, title, description }: any) => (
  <div className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
    <div className="w-10 h-10 shrink-0 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-black text-white">{title}</h4>
      <p className="text-[11px] text-slate-400 leading-normal font-medium">{description}</p>
    </div>
  </div>
);

const KeyDetail = ({ keyCap, title, description }: { keyCap: string, title: string, description: string }) => (
  <div className="flex flex-col gap-2 p-4 bg-slate-950/50 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-black text-white uppercase tracking-wider">{title}</h4>
      <div className="px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono font-bold text-blue-400 min-w-[3.5rem] text-center shadow-inner group-hover:text-white transition-colors">
        {keyCap}
      </div>
    </div>
    <p className="text-[10px] text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">
      {description}
    </p>
  </div>
);

export default HelpDialog;
