
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { OrbitControls, Environment, Grid, Sky, PerspectiveCamera } from '@react-three/drei';
import { AppMode, PartData, PartType, GRID_SIZE, PlayTool, SelectedFace } from './types';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';

// Components
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import PaintPanel from './components/PaintPanel';
import LibraryPanel from './components/LibraryPanel';
import ControlHUD from './components/ControlHUD';
import SettingsPanel from './components/SettingsPanel';
import HelpDialog from './components/HelpDialog';
import ConfirmDialog from './components/ConfirmDialog';
import FacePickerOverlay from './components/FacePickerOverlay';

const STORAGE_KEY = 'machine-crafter-3d-save';

const CameraReporter: React.FC<{ onUpdate: (cam: THREE.Camera) => void }> = ({ onUpdate }) => {
  const { camera } = useThree();
  useEffect(() => {
    onUpdate(camera);
  }, [camera, onUpdate]);
  return null;
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CONSTRUCTION);
  const [isPaused, setIsPaused] = useState(false);
  const [playTool, setPlayTool] = useState<PlayTool>(PlayTool.DRAG);
  const [parts, setParts] = useState<PartData[]>([]);
  const [history, setHistory] = useState<PartData[][]>([]);
  const [selectedPartType, setSelectedPartType] = useState<PartType>(PartType.BLOCK);
  const [selectedFace, setSelectedFace] = useState<SelectedFace | null>(null);
  const [currentPaint, setCurrentPaint] = useState<{ color?: string; finish?: string }>({ color: '#3b82f6', finish: 'matte' });
  const [currentRotation, setCurrentRotation] = useState<[number, number, number, number]>([0, 0, 0, 1]);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [hoveredRotationAxis, setHoveredRotationAxis] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [recentPartTypes, setRecentPartTypes] = useState<PartType[]>([PartType.BLOCK]);
  const [recentColors, setRecentColors] = useState<string[]>(['#3b82f6']);

  const cameraRef = useRef<THREE.Camera | null>(null);
  const toastTimeout = useRef<any>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  };

  const saveToHistory = useCallback((newParts: PartData[]) => {
    setHistory(prev => [newParts, ...prev.slice(0, 19)]);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setParts(last);
    setHistory(rest);
    showToast("Action Undone");
  }, [history]);

  const addPart = useCallback((pos: [number, number, number], normal: [number, number, number], autoRotation: [number, number, number, number]) => {
    const newPart: PartData = {
      id: uuidv4(),
      type: selectedPartType,
      position: pos,
      rotation: autoRotation,
      customColor: currentPaint.color,
      customFinish: currentPaint.finish as any,
      settings: {}
    };
    saveToHistory(parts);
    setParts(prev => [...prev, newPart]);
    setRecentPartTypes(prev => [selectedPartType, ...prev.filter(t => t !== selectedPartType)].slice(0, 6));
  }, [selectedPartType, parts, currentPaint, saveToHistory]);

  const removePart = useCallback((id: string) => {
    saveToHistory(parts);
    setParts(prev => prev.filter(p => p.id !== id));
  }, [parts, saveToHistory]);

  const paintPart = useCallback((id: string) => {
    saveToHistory(parts);
    setParts(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          customColor: currentPaint.color || p.customColor, 
          customFinish: (currentPaint.finish as any) || p.customFinish 
        };
      }
      return p;
    }));
    if (currentPaint.color) {
      setRecentColors(prev => [currentPaint.color!, ...prev.filter(c => c !== currentPaint.color)].slice(0, 6));
    }
  }, [parts, currentPaint, saveToHistory]);

  const saveMachine = () => {
    if (parts.length === 0) {
      showToast("No parts to save");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    showToast("Machine Saved to Library");
  };

  const loadMachine = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loadedParts = JSON.parse(saved);
        saveToHistory(parts);
        setParts(loadedParts);
        showToast("Machine Loaded");
        setMode(AppMode.CONSTRUCTION);
      } catch (e) {
        showToast("Error loading file");
      }
    } else {
      showToast("No saved machine found");
    }
  };

  const clearAll = () => {
    saveToHistory(parts);
    setParts([]);
    setIsClearConfirmOpen(false);
    showToast("Workspace Cleared");
  };

  const moveAll = (dir: 'up' | 'down') => {
    const delta = dir === 'up' ? 1 : -1;
    saveToHistory(parts);
    setParts(prev => prev.map(p => ({
      ...p,
      position: [p.position[0], p.position[1] + delta, p.position[2]]
    })));
  };

  const rotateAxis = (axisIdx: number) => {
    if (!cameraRef.current) return;
    
    const q = new THREE.Quaternion(...currentRotation);
    const axis = new THREE.Vector3();
    
    // Logic:
    // Z Button (2) -> World Vertical (0, 1, 0) - Perpendicular to floor
    // X Button (0) -> Grid Axis (X or Z) most aligned with Camera Right
    // Y Button (1) -> The other Grid Axis

    const cam = cameraRef.current;
    
    if (axisIdx === 2) {
      // Perpendicular to floor
      axis.set(0, 1, 0);
    } else {
      // Determine camera right vector
      const camDir = new THREE.Vector3();
      cam.getWorldDirection(camDir);
      const worldUp = new THREE.Vector3(0, 1, 0);
      const camRight = new THREE.Vector3().crossVectors(camDir, worldUp).normalize();
      
      const worldX = new THREE.Vector3(1, 0, 0);
      const worldZ = new THREE.Vector3(0, 0, 1);
      
      const dotX = Math.abs(camRight.dot(worldX));
      const dotZ = Math.abs(camRight.dot(worldZ));
      
      const mostHorizontal = dotX > dotZ ? worldX : worldZ;
      const otherAxis = dotX > dotZ ? worldZ : worldX;
      
      if (axisIdx === 0) {
        axis.copy(mostHorizontal);
      } else {
        axis.copy(otherAxis);
      }
    }
    
    const rot = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
    q.premultiply(rot);
    setCurrentRotation([q.x, q.y, q.z, q.w]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingPartId || mode === AppMode.LIBRARY) return;
      
      if (mode === AppMode.CONSTRUCTION) {
        if (e.key.toLowerCase() === 'x') rotateAxis(0);
        if (e.key.toLowerCase() === 'y') rotateAxis(1);
        if (e.key.toLowerCase() === 'z') rotateAxis(2);
      }
      
      if (e.key === 'Backspace' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      }
      
      if (e.key === 'PageUp') {
        e.preventDefault();
        moveAll('up');
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        moveAll('down');
      }
      
      if (e.key === '?') {
        setIsHelpOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRotation, mode, editingPartId, undo]);

  const editingPart = parts.find(p => p.id === editingPartId);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <CameraReporter onUpdate={(cam) => cameraRef.current = cam} />
        
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />

        <Physics gravity={[0, -9.81, 0]} paused={isPaused || mode !== AppMode.PLAY}>
          <Scene 
            mode={mode}
            playTool={playTool}
            parts={parts}
            onAddPart={addPart}
            onRemovePart={removePart}
            onEditPart={setEditingPartId}
            onPaintPart={paintPart}
            selectedPartType={selectedPartType}
            selectedFace={selectedFace}
            currentRotation={currentRotation}
            currentPaint={currentPaint}
            hoveredRotationAxis={hoveredRotationAxis}
          />
        </Physics>

        <OrbitControls 
          makeDefault 
          enabled={mode !== AppMode.FACE_PICKER && mode !== AppMode.LIBRARY}
          minDistance={2}
          maxDistance={100}
        />
        
        <Grid 
          infiniteGrid 
          cellSize={1} 
          sectionSize={5} 
          fadeDistance={50} 
          cellColor="#334155" 
          sectionColor="#6366f1" 
          cellThickness={0.5} 
          sectionThickness={1.5}
          position={[0, -0.49, 0]}
        />
      </Canvas>

      <Sidebar 
        currentType={selectedPartType} 
        onSelectType={setSelectedPartType} 
        mode={mode} 
        partCount={parts.length}
        recentPartTypes={recentPartTypes}
      />
      
      <PaintPanel 
        currentPaint={currentPaint} 
        onSelectPaint={(t, v) => setCurrentPaint(prev => ({ ...prev, [t]: v }))} 
        mode={mode} 
        recentColors={recentColors}
      />

      {mode === AppMode.LIBRARY && (
        <LibraryPanel 
          onSave={saveMachine}
          onLoad={loadMachine}
          onClose={() => setMode(AppMode.CONSTRUCTION)}
          partCount={parts.length}
        />
      )}

      <ControlHUD 
        mode={mode} 
        setMode={setMode}
        isPaused={isPaused} 
        togglePause={() => setIsPaused(!isPaused)}
        playTool={playTool} 
        setPlayTool={setPlayTool}
        undo={undo}
        moveAll={moveAll}
        clearAll={() => setIsClearConfirmOpen(true)}
        rotation={currentRotation}
        rotateAxis={rotateAxis}
        setHoveredRotationAxis={setHoveredRotationAxis}
        onToggleHelp={() => setIsHelpOpen(!isHelpOpen)}
        toggleFacePicker={() => setMode(mode === AppMode.FACE_PICKER ? AppMode.CONSTRUCTION : AppMode.FACE_PICKER)}
      />

      {editingPartId && editingPart && (
        <SettingsPanel 
          part={editingPart} 
          onSave={(settings) => {
            setParts(prev => prev.map(p => p.id === editingPartId ? { ...p, settings } : p));
            setEditingPartId(null);
            showToast("Settings Applied");
          }} 
          onCancel={() => setEditingPartId(null)} 
        />
      )}

      {mode === AppMode.FACE_PICKER && (
        <FacePickerOverlay 
          type={selectedPartType}
          selectedFace={selectedFace}
          onSelectFace={(face) => {
            setSelectedFace(face);
            setMode(AppMode.CONSTRUCTION);
            showToast("Attachment Point Set");
          }}
          onClose={() => setMode(AppMode.CONSTRUCTION)}
        />
      )}

      {isHelpOpen && <HelpDialog onClose={() => setIsHelpOpen(false)} />}
      
      {isClearConfirmOpen && (
        <ConfirmDialog 
          title="Clear Workspace?" 
          message="This will delete all components currently on the grid. This action can be undone."
          confirmLabel="Erase Everything"
          onConfirm={clearAll}
          onCancel={() => setIsClearConfirmOpen(false)}
        />
      )}

      <div className={`
        absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 flex items-center gap-3 z-[200]
        ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}
      `}>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-black text-white uppercase tracking-widest">{toast}</span>
      </div>
    </div>
  );
};

export const ThreeDimensionVisualizationApp = App;
