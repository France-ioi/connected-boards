
import React, { useState } from 'react';
import { PartType, AppMode } from '../types';
import { CATEGORIES, PART_DEFINITIONS } from '../constants';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeftOpen, History } from 'lucide-react';

interface SidebarProps {
  currentType: PartType;
  onSelectType: (type: PartType) => void;
  mode: AppMode;
  partCount: number;
  recentPartTypes: PartType[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentType, onSelectType, mode, partCount, recentPartTypes }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>('Recent');

  // Strictly only show inventory in Construction (Build) mode
  if (mode !== AppMode.CONSTRUCTION) return null;

  const categoriesToRender = [
    ...(recentPartTypes.length > 0 ? [{ name: 'Recent', types: recentPartTypes, isRecent: true }] : []),
    ...CATEGORIES
  ];

  return (
    <>
      {/* Toggle Button when collapsed - Ensure left-0 to touch the edge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-slate-900/80 backdrop-blur-md border border-white/10 border-l-0 rounded-r-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-40 shadow-2xl"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Main Panel */}
      <div 
        className={`
          absolute left-0 top-0 h-full bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 z-40 flex flex-col transition-all duration-500 ease-out shadow-2xl
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}
        `}
      >
        {/* Panel Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">INVENTORY</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Part Selection</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Accordion Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 pb-32">
          {categoriesToRender.map((cat: any) => {
            const isExpanded = activeCategory === cat.name;
            const isRecent = cat.isRecent;
            
            return (
              <div 
                key={cat.name} 
                className={`
                  flex flex-col border border-white/5 rounded-2xl transition-all duration-300
                  ${isExpanded ? 'bg-white/[0.02] border-white/10' : 'bg-transparent'}
                `}
              >
                <button
                  onClick={() => setActiveCategory(isExpanded ? null : cat.name)}
                  className={`
                    flex items-center justify-between p-4 text-left transition-colors rounded-2xl z-20
                    ${isExpanded ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                  `}
                >
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    {isRecent && <History size={14} className="text-blue-400" />}
                    {cat.name}
                  </span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div 
                  className={`
                    grid grid-cols-3 gap-2 transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-h-96 p-4 opacity-100 scale-100 overflow-visible' : 'max-h-0 p-0 opacity-0 scale-95 overflow-hidden pointer-events-none'}
                  `}
                >
                  {cat.types.map((type: PartType) => {
                    const def = PART_DEFINITIONS.find(d => d.type === type)!;
                    const isActive = currentType === type;
                    
                    return (
                      <button
                        key={`${cat.name}-${type}`}
                        onClick={() => onSelectType(type)}
                        className={`
                          aspect-square rounded-xl flex items-center justify-center transition-all duration-300 group relative
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 z-30' 
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-200 border border-white/5 hover:z-30'
                          }
                        `}
                      >
                        {def.icon}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0">
                          {def.name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {partCount < 4 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-4">
              <p className="text-[10px] text-blue-400 font-medium leading-relaxed">
                Select a part and click anywhere in the grid to start building your machine.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
