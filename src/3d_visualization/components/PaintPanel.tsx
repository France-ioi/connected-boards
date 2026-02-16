
import React, { useState } from 'react';
import { AppMode } from '../types';
import { PAINT_CATEGORIES } from '../constants';
import { ChevronRight, ChevronDown, PanelLeftClose, PanelLeftOpen, Check, Pipette, History } from 'lucide-react';

interface PaintPanelProps {
  currentPaint: { color?: string; finish?: string };
  onSelectPaint: (type: 'color' | 'finish', value: string) => void;
  mode: AppMode;
  recentColors: string[];
}

const PaintPanel: React.FC<PaintPanelProps> = ({ currentPaint, onSelectPaint, mode, recentColors }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>('Recent');

  if (mode !== AppMode.PAINT) return null;

  const isCustomColorActive = !PAINT_CATEGORIES.some(cat => 
    cat.name !== 'Finishes' && cat.items.some(item => item.value === currentPaint.color)
  ) && currentPaint.color !== undefined;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-20 bg-slate-900/80 backdrop-blur-md border border-white/10 border-l-0 rounded-r-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all z-40 shadow-2xl"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      <div 
        className={`
          absolute left-0 top-0 h-full bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 z-40 flex flex-col transition-all duration-500 ease-out shadow-2xl
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">PAINT SHOP</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Customization</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 pb-32">
          
          {/* Recent Colors Section */}
          {recentColors.length > 0 && (
            <div className={`flex flex-col border border-white/5 rounded-2xl transition-all duration-300 ${activeCategory === 'Recent' ? 'bg-white/[0.02] border-white/10' : 'bg-transparent'}`}>
              <button
                onClick={() => setActiveCategory(activeCategory === 'Recent' ? null : 'Recent')}
                className={`flex items-center justify-between p-4 text-left transition-colors rounded-2xl z-20 ${activeCategory === 'Recent' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-blue-400" />
                  Recent Colors
                </span>
                {activeCategory === 'Recent' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div 
                className={`grid grid-cols-3 gap-2 transition-all duration-300 ease-in-out ${activeCategory === 'Recent' ? 'max-h-96 p-4 opacity-100 scale-100 overflow-visible' : 'max-h-0 p-0 opacity-0 scale-95 overflow-hidden pointer-events-none'}`}
              >
                {recentColors.map((color, idx) => {
                  const isSelected = currentPaint.color === color;
                  return (
                    <button
                      key={`recent-${color}-${idx}`}
                      onClick={() => onSelectPaint('color', color)}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center transition-all duration-300 group relative
                        ${isSelected 
                          ? 'bg-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }
                      `}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && <Check size={16} className="text-white drop-shadow-sm" />}
                      </div>
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-mono font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0 uppercase">
                        {color}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Color Picker Section */}
          <div className={`flex flex-col border border-white/5 rounded-2xl transition-all duration-300 ${activeCategory === 'Custom' ? 'bg-white/[0.02] border-white/10' : 'bg-transparent'}`}>
            <button
              onClick={() => setActiveCategory(activeCategory === 'Custom' ? null : 'Custom')}
              className={`flex items-center justify-between p-4 text-left transition-colors rounded-2xl z-20 ${activeCategory === 'Custom' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Pipette size={14} />
                Custom Color
              </span>
              {activeCategory === 'Custom' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${activeCategory === 'Custom' ? 'max-h-96 p-4 opacity-100 scale-100' : 'max-h-0 p-0 opacity-0 scale-95 overflow-hidden pointer-events-none'}`}
            >
              <div className="flex flex-col gap-4">
                <div className="relative group flex items-center gap-3 bg-slate-900 border border-white/10 p-3 rounded-2xl hover:border-blue-500/50 transition-all">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-inner border border-white/20 relative overflow-hidden"
                    style={{ backgroundColor: currentPaint.color || '#3b82f6' }}
                  >
                    <input 
                      type="color" 
                      value={currentPaint.color || '#3b82f6'}
                      onChange={(e) => onSelectPaint('color', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selected Hex</span>
                    <span className="text-sm font-mono font-bold text-white uppercase">{currentPaint.color || '#3b82f6'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          {PAINT_CATEGORIES.map((cat) => {
            const isExpanded = activeCategory === cat.name;
            const isFinish = cat.name === 'Finishes';
            
            return (
              <div 
                key={cat.name} 
                className={`flex flex-col border border-white/5 rounded-2xl transition-all duration-300 ${isExpanded ? 'bg-white/[0.02] border-white/10' : 'bg-transparent'}`}
              >
                <button
                  onClick={() => setActiveCategory(isExpanded ? null : cat.name)}
                  className={`flex items-center justify-between p-4 text-left transition-colors rounded-2xl z-20 ${isExpanded ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div 
                  className={`grid grid-cols-3 gap-2 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 p-4 opacity-100 scale-100 overflow-visible' : 'max-h-0 p-0 opacity-0 scale-95 overflow-hidden pointer-events-none'}`}
                >
                  {cat.items.map((item) => {
                    const isSelected = isFinish 
                      ? currentPaint.finish === item.value
                      : currentPaint.color === item.value;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectPaint(isFinish ? 'finish' : 'color', item.value)}
                        className={`
                          aspect-square rounded-xl flex items-center justify-center transition-all duration-300 group relative
                          ${isSelected 
                            ? 'bg-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20 scale-105 z-30' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                          }
                        `}
                      >
                        {isFinish ? (
                          <div className={`flex flex-col items-center gap-1 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                            {item.icon}
                            <span className="text-[7px] font-black uppercase tracking-tighter">{item.name}</span>
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: item.value }}
                          >
                            {isSelected && <Check size={16} className="text-white drop-shadow-sm" />}
                          </div>
                        )}
                        
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0">
                          {item.name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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

export default PaintPanel;
