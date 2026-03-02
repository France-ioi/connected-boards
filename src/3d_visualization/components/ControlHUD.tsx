
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, PlayTool, SelectedFace } from '../types';
import { 
  Play, 
  Pause,
  Hammer, 
  Trash2, 
  Undo2, 
  Settings, 
  ChevronUp, 
  ChevronDown,
  RotateCw,
  HelpCircle,
  Palette,
  Hand,
  MousePointer2,
  Zap,
  Trash,
  FolderOpen,
  BoxSelect,
  CheckCircle2
} from 'lucide-react';

interface ControlHUDProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isPaused: boolean;
  togglePause: () => void;
  playTool: PlayTool;
  setPlayTool: (tool: PlayTool) => void;
  undo: () => void;
  moveAll: (dir: 'up' | 'down') => void;
  clearAll: () => void;
  rotation: [number, number, number, number];
  rotateAxis: (axis: number) => void;
  setHoveredRotationAxis: (axis: number | null) => void;
  onToggleHelp: () => void;
  toggleFacePicker: () => void;
  selectedFace: SelectedFace | null;
  onReset: () => void;
}

const ControlHUD: React.FC<ControlHUDProps> = ({ 
  mode, setMode, isPaused, togglePause, playTool, setPlayTool, undo, moveAll, clearAll, rotation, rotateAxis, setHoveredRotationAxis, onToggleHelp, toggleFacePicker, selectedFace, onReset
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPlayMode = mode === AppMode.PLAY;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const path = event.composedPath();

      if (menuRef.current && !path.includes(menuRef.current)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const modes = [
    { id: AppMode.CONSTRUCTION, label: 'Build', icon: <Hammer size={18} /> },
    { id: AppMode.DELETE, label: 'Erase', icon: <Trash2 size={18} /> },
    { id: AppMode.PAINT, label: 'Paint', icon: <Palette size={18} /> },
    { id: AppMode.SETTINGS, label: 'Config', icon: <Settings size={18} /> },
    { id: AppMode.LIBRARY, label: 'Library', icon: <FolderOpen size={18} /> },
    { id: AppMode.PLAY, label: 'Run', icon: <Play size={18} /> },
  ];

  const currentModeData = modes.find(m => m.id === mode) || modes[0];

  const handleModeClick = (selectedMode: AppMode) => {
    if (selectedMode === AppMode.PLAY && mode === AppMode.PLAY) {
      onReset();
    } else {
      setMode(selectedMode);
    }
    setIsMenuOpen(false);
  };

  const handleMainButtonClick = () => {
    // If we are in Play mode and opening the menu, reset the simulation
    if (mode === AppMode.PLAY && !isMenuOpen) {
      onReset();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center z-50 px-4">
      <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 shadow-2xl pointer-events-auto transition-all">
        
        <div className="relative" ref={menuRef}>
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 transition-all duration-500 flex flex-col items-center gap-0.5 ${isMenuOpen ? 'opacity-100 translate-y-[-2px]' : 'opacity-40'}`}>
             <div className="w-1 h-1 rounded-full bg-blue-400 mb-0.5" />
             <ChevronUp size={10} className="text-white/60" />
          </div>

          <button
            onClick={handleMainButtonClick}
            className={`
              flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative overflow-hidden group
              ${isPlayMode ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : mode === AppMode.LIBRARY ? 'bg-amber-600 shadow-lg shadow-amber-600/30 text-white' : 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white'}
              ${isMenuOpen ? 'scale-95 brightness-110' : 'hover:scale-105 active:scale-90'}
            `}
          >
            <div className="relative z-10 flex flex-col items-center">
              {currentModeData.icon}
              <span className="text-[7px] font-black uppercase tracking-tighter mt-1">{currentModeData.label}</span>
            </div>
            {!isPlayMode && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />}
          </button>

          <div className={`
            absolute bottom-full mb-6 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 p-2 bg-slate-950 border border-white/10 rounded-[2rem] shadow-[0_-15px_50px_rgba(0,0,0,0.8)] transition-all duration-400 origin-bottom
            ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-8 pointer-events-none'}
          `}>
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeClick(m.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all group
                  ${mode === m.id 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center transition-all
                  ${mode === m.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-900 group-hover:scale-110'}
                `}>
                  {m.icon}
                </div>
                <div className="flex flex-col items-start min-w-[70px]">
                  <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                </div>
                {mode === m.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse ml-2" />}
              </button>
            ))}
          </div>
        </div>

        {isPlayMode && (
          <button
            onClick={togglePause}
            className={`
              w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg active:scale-90
              ${isPaused 
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500' 
                : 'bg-amber-600 text-white shadow-amber-600/20 hover:bg-amber-500'
              }
            `}
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
            <span className="text-[7px] font-black uppercase tracking-tighter mt-1">
              {isPaused ? 'Resume' : 'Pause'}
            </span>
          </button>
        )}

        <div className="w-px h-10 bg-white/10 mx-0.5 flex-shrink-0" />

        <div className="flex gap-1.5 flex-shrink-0">
          {!isPlayMode ? (
            <>
              <ActionBtn 
                onClick={undo} 
                icon={<Undo2 size={18} />} 
                shortcut="BS"
                tooltip="Undo Action"
              />
              
              {mode === AppMode.DELETE && (
                <ActionBtn 
                  onClick={clearAll} 
                  icon={<Trash size={18} className="text-red-400" />} 
                  shortcut="CLR"
                  tooltip="Wipe Everything"
                />
              )}

              <ActionBtn 
                onClick={() => moveAll('up')} 
                icon={<ChevronUp size={18} />} 
                shortcut="PU"
                tooltip="Shift Up"
              />
              <ActionBtn 
                onClick={() => moveAll('down')} 
                icon={<ChevronDown size={18} />} 
                shortcut="PD"
                tooltip="Shift Down"
              />
            </>
          ) : (
            <>
              <ToolBtn 
                active={playTool === PlayTool.PUSH} 
                onClick={() => setPlayTool(PlayTool.PUSH)} 
                icon={<Hand size={18} />} 
                label="Push" 
              />
              <ToolBtn 
                active={playTool === PlayTool.DRAG} 
                onClick={() => setPlayTool(PlayTool.DRAG)} 
                icon={<MousePointer2 size={18} />} 
                label="Drag" 
              />
              <ToolBtn 
                active={playTool === PlayTool.KICK} 
                onClick={() => setPlayTool(PlayTool.KICK)} 
                icon={<Zap size={18} />} 
                label="Kick" 
              />
            </>
          )}
        </div>

        <div className="w-px h-10 bg-white/10 mx-0.5 flex-shrink-0" />

        <div className="flex gap-1.5 flex-shrink-0">
           {(mode === AppMode.CONSTRUCTION || mode === AppMode.FACE_PICKER) && (
              <button
                onClick={toggleFacePicker}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group relative active:scale-90
                  ${mode === AppMode.FACE_PICKER 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' 
                    : selectedFace
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' 
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <BoxSelect size={18} />
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[8px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0">
                  {selectedFace ? 'Face Locked (Click to Change)' : 'Face Selection Tool'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                </div>
              </button>
           )}

          <ActionBtn 
            onClick={onToggleHelp} 
            icon={<HelpCircle size={18} />} 
            shortcut="?"
            tooltip="User Guide"
          />
        </div>

        {mode === AppMode.CONSTRUCTION && (
          <>
            <div className="w-px h-10 bg-white/10 mx-0.5 flex-shrink-0" />
            <div className="flex gap-1.5 flex-shrink-0 pr-1">
              <RotBtn label="X" onClick={() => rotateAxis(0)} onMouseEnter={() => setHoveredRotationAxis(0)} onMouseLeave={() => setHoveredRotationAxis(null)} />
              <RotBtn label="Y" onClick={() => rotateAxis(1)} onMouseEnter={() => setHoveredRotationAxis(1)} onMouseLeave={() => setHoveredRotationAxis(null)} />
              <RotBtn label="Z" onClick={() => rotateAxis(2)} onMouseEnter={() => setHoveredRotationAxis(2)} onMouseLeave={() => setHoveredRotationAxis(null)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ onClick, icon, shortcut, tooltip }: any) => (
  <button
    onClick={onClick}
    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all group relative active:scale-90"
  >
    {icon}
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[8px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0">
      {tooltip} <span className="text-slate-500 font-mono ml-1 opacity-50">[{shortcut}]</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
    </div>
  </button>
);

const ToolBtn = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 active:scale-90
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 z-10' 
        : 'bg-white/5 text-slate-500 hover:text-slate-200 hover:bg-white/10'
      }
    `}
  >
    {icon}
    <span className="text-[7px] font-black uppercase mt-1 tracking-tighter">{label}</span>
  </button>
);

const RotBtn = ({ label, onClick, onMouseEnter, onMouseLeave }: any) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-blue-500 transition-all active:scale-90 group relative"
  >
    <RotateCw size={12} className="mb-0.5 opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
    <span className="text-[9px] font-black">{label}</span>
    
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-[8px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl transition-all z-50 transform translate-y-1 group-hover:translate-y-0">
      Rotate around {label} axis
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
    </div>
  </button>
);

export default ControlHUD;
