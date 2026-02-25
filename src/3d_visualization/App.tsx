import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Physics} from '@react-three/rapier';
import {Environment, Grid, OrbitControls, PerspectiveCamera, Sky} from '@react-three/drei';
import {AppMode, FloorTileMap, PaintMode, PartData, PartType, PlayTool, SelectedFace} from './types';
import {PART_DEFINITIONS} from './constants';
import {v4 as uuidv4} from 'uuid';
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
import {QuickalgoLibrary} from "../definitions";
import {subscribeToContextStateChanges, updateContextSensors} from "./3d_interface";
import {useDispatch, useSelector} from "react-redux";

const STORAGE_KEY = 'machine-crafter-3d-save';

const getOccupiedCells = (part: PartData): [number, number, number][] => {
  const basePos = new THREE.Vector3(...part.position);
  const cells: [number, number, number][] = [[Math.round(basePos.x), Math.round(basePos.y), Math.round(basePos.z)]];

  if (part.type === PartType.BLOCK_LONG) {
    const quat = new THREE.Quaternion(...part.rotation);
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    const p1 = basePos.clone().add(dir);
    const p2 = basePos.clone().sub(dir);
    cells.push([Math.round(p1.x), Math.round(p1.y), Math.round(p1.z)]);
    cells.push([Math.round(p2.x), Math.round(p2.y), Math.round(p2.z)]);
  }
  return cells;
};

const CameraReporter: React.FC<{ onUpdate: (cam: THREE.Camera) => void }> = ({ onUpdate }) => {
  const { camera } = useThree();
  useEffect(() => {
    onUpdate(camera);
  }, [camera, onUpdate]);
  return null;
};

const KeyboardCameraControls: React.FC<{ controlsRef: React.RefObject<any>, isDragging: boolean }> = ({ controlsRef, isDragging }) => {
  const { camera } = useThree();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      switch(e.key) {
        case 'ArrowUp':
          setMovement(m => ({ ...m, forward: true }));
          break;
        case 'ArrowDown':
          setMovement(m => ({ ...m, backward: true }));
          break;
        case 'ArrowLeft':
          setMovement(m => ({ ...m, left: true }));
          break;
        case 'ArrowRight':
          setMovement(m => ({ ...m, right: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
          setMovement(m => ({ ...m, forward: false }));
          break;
        case 'ArrowDown':
          setMovement(m => ({ ...m, backward: false }));
          break;
        case 'ArrowLeft':
          setMovement(m => ({ ...m, left: false }));
          break;
        case 'ArrowRight':
          setMovement(m => ({ ...m, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (isDragging) return;
    if (!movement.forward && !movement.backward && !movement.left && !movement.right) return;

    const moveSpeed = 20 * delta;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.001) {
      forward.copy(camera.up);
      forward.y = 0;
    }
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveVec = new THREE.Vector3();

    if (movement.forward) moveVec.add(forward);
    if (movement.backward) moveVec.sub(forward);
    if (movement.left) moveVec.sub(right);
    if (movement.right) moveVec.add(right);

    if (moveVec.lengthSq() > 0) {
      moveVec.normalize().multiplyScalar(moveSpeed);
      camera.position.add(moveVec);
      if (controlsRef.current) {
        controlsRef.current.target.add(moveVec);
        controlsRef.current.update();
      }
    }
  });

  return null;
};

export const ThreeDimensionVisualizationApp: React.FC<{context: QuickalgoLibrary}> = ({context}) => {
  const [mode, setMode] = useState<AppMode>(AppMode.CONSTRUCTION);
  const [paintMode, setPaintMode] = useState<PaintMode>(PaintMode.BLOCK);
  const [isPaused, setIsPaused] = useState(false);
  const [playTool, setPlayTool] = useState<PlayTool>(PlayTool.DRAG);
  const [parts, setParts] = useState<PartData[]>([]);
  const [floorTiles, setFloorTiles] = useState<FloorTileMap>({});
  const [history, setHistory] = useState<PartData[][]>([]);
  const [selectedPartType, setSelectedPartType] = useState<PartType>(PartType.BLOCK);
  const [selectedFace, setSelectedFace] = useState<SelectedFace | null>(null);
  const [currentPaint, setCurrentPaint] = useState<{ color?: string; finish?: string }>({ color: '#3b82f6', finish: 'matte' });
  const [currentRotation, setCurrentRotation] = useState<[number, number, number, number]>([0, 0, 0, 1]);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [hoveredRotationAxis, setHoveredRotationAxis] = useState<number | null>(null);
  const [temporaryRotationAxis, setTemporaryRotationAxis] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [recentPartTypes, setRecentPartTypes] = useState<PartType[]>([PartType.BLOCK]);
  const [recentColors, setRecentColors] = useState<string[]>(['#3b82f6']);
  const [simulationKey, setSimulationKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<any>(null);
  const toastTimeout = useRef<any>(null);
  const axisTimeoutRef = useRef<any>(null);

  const stepperStatus = useSelector((state: any) => state.stepper.status);
  const dispatch = useDispatch();
  
  const changeMode = (newMode: AppMode) => {
    if (AppMode.PLAY === mode && AppMode.PLAY !== newMode) {
      dispatch({type: 'Stepper.Exit'});
    }

    setMode(newMode);
  };

  useEffect(() => {
    if ('running' === stepperStatus) {
      if (AppMode.PLAY !== mode) {
        setMode(AppMode.PLAY);
      } else {
        handleResetSimulation();
      }
    }
  }, [stepperStatus]);

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

  const paintPart = useCallback((id: string, hitNormal?: THREE.Vector3, isFloor: boolean = false, hitPoint?: THREE.Vector3) => {
    const targetColor = currentPaint.color || '#3b82f6';

    // Update Recent Colors
    setRecentColors(prev => [targetColor, ...prev.filter(c => c !== targetColor)].slice(0, 6));

    // Handle Floor Painting
    if (isFloor && hitPoint) {
      if (paintMode === PaintMode.BLOCK) return; // Block mode doesn't paint floor spots usually, but let's restrict to face/fill
      const x = Math.round(hitPoint.x);
      const z = Math.round(hitPoint.z);
      const key = `${x},${z}`;

      setFloorTiles(prev => ({
        ...prev,
        [key]: targetColor
      }));
      return;
    }

    saveToHistory(parts);

    // BLOCK MODE: Simple entire block painting
    if (paintMode === PaintMode.BLOCK) {
      setParts(prev => prev.map(p => {
        if (p.id === id) {
          // Clear face colors when painting whole block
          const { faceColors, ...rest } = p;
          return {
            ...rest,
            customColor: targetColor,
            customFinish: (currentPaint.finish as any) || p.customFinish
          };
        }
        return p;
      }));
      return;
    }

    // Prepare for FACE or FILL mode
    if (!hitNormal) return;

    // Helper to get local face index (0-5) from world normal and part rotation
    const getLocalFaceIndex = (part: PartData, worldNormal: THREE.Vector3) => {
      const q = new THREE.Quaternion(...part.rotation);
      const localNormal = worldNormal.clone().applyQuaternion(q.clone().invert()).round();
      // Map normal to index: +x=0, -x=1, +y=2, -y=3, +z=4, -z=5
      if (localNormal.x > 0.5) return 0;
      if (localNormal.x < -0.5) return 1;
      if (localNormal.y > 0.5) return 2;
      if (localNormal.y < -0.5) return 3;
      if (localNormal.z > 0.5) return 4;
      if (localNormal.z < -0.5) return 5;
      return 2; // Default Top
    };

    // FACE MODE: Paint single face
    if (paintMode === PaintMode.FACE) {
      setParts(prev => prev.map(p => {
        if (p.id === id) {
          const faceIdx = getLocalFaceIndex(p, hitNormal);
          const newFaceColors = { ...(p.faceColors || {}) };
          newFaceColors[faceIdx] = targetColor;
          return { ...p, faceColors: newFaceColors };
        }
        return p;
      }));
      return;
    }

    // FILL MODE: Flood fill connected co-planar faces
    if (paintMode === PaintMode.FILL) {
      // 1. Identify start
      const startPart = parts.find(p => p.id === id);
      if (!startPart) return;

      const startFaceIdx = getLocalFaceIndex(startPart, hitNormal);
      const startGlobalColor = startPart.faceColors?.[startFaceIdx] || startPart.customColor || PART_DEFINITIONS.find(d => d.type === startPart.type)?.color || '#3b82f6';

      // If we are painting with the same color, do nothing
      if (startGlobalColor === targetColor) return;

      // 2. BFS
      const queue = [startPart];
      const visitedIds = new Set<string>();
      visitedIds.add(startPart.id);

      // We need to build a map of part updates
      const partUpdates = new Map<string, PartData>(); // Stores updated parts

      // Helper to check if two vectors are approx equal
      const vecEq = (v1: THREE.Vector3, v2: THREE.Vector3) => v1.distanceToSquared(v2) < 0.1;

      // We are flooding across a specific PLANE defined by the hitNormal.
      // We look for neighbors in directions PERPENDICULAR to hitNormal.
      const worldNormal = hitNormal.clone().round();
      const directions: THREE.Vector3[] = [];

      if (Math.abs(worldNormal.y) > 0.9) { // Up/Down -> look X/Z
        directions.push(new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1));
      } else if (Math.abs(worldNormal.x) > 0.9) { // Left/Right -> look Y/Z
        directions.push(new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0), new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1));
      } else { // Front/Back -> look X/Y
        directions.push(new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0));
      }

      while (queue.length > 0) {
        const curr = queue.shift()!;

        // Determine the local face index for this part that matches the worldNormal
        const localFaceIdx = getLocalFaceIndex(curr, worldNormal);

        // Update this part in our map
        const prevData = partUpdates.get(curr.id) || curr;
        const newFaceColors = { ...(prevData.faceColors || {}) };
        newFaceColors[localFaceIdx] = targetColor;
        partUpdates.set(curr.id, { ...prevData, faceColors: newFaceColors });

        // Find neighbors
        const currPos = new THREE.Vector3(...curr.position);

        for (const dir of directions) {
          const neighborPos = currPos.clone().add(dir);
          // Find part at neighborPos
          const neighbor = parts.find(p => {
            const pPos = new THREE.Vector3(...p.position);
            // Simple check for 1x1 blocks. For bigger blocks, collision logic is needed, keeping simple for now.
            return vecEq(pPos, neighborPos);
          });

          if (neighbor && !visitedIds.has(neighbor.id)) {
            // Check if neighbor has a face matching worldNormal
            const neighborLocalFaceIdx = getLocalFaceIndex(neighbor, worldNormal);
            // Check if that face has the SAME color as the START color
            const nColor = neighbor.faceColors?.[neighborLocalFaceIdx] || neighbor.customColor || PART_DEFINITIONS.find(d => d.type === neighbor.type)?.color || '#3b82f6';

            if (nColor === startGlobalColor) {
              visitedIds.add(neighbor.id);
              queue.push(neighbor);
            }
          }
        }
      }

      // Apply updates
      setParts(prev => prev.map(p => partUpdates.has(p.id) ? partUpdates.get(p.id)! : p));
    }

  }, [parts, currentPaint, saveToHistory, paintMode]);

  const saveMachine = () => {
    if (parts.length === 0) {
      showToast("No parts to save");
      return;
    }
    const data = { parts, floorTiles };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast("Machine Saved to Library");
  };

  const loadMachine = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        saveToHistory(parts);
        // Handle legacy saves (array) vs new saves (object)
        if (Array.isArray(loaded)) {
          setParts(loaded);
          setFloorTiles({});
        } else {
          setParts(loaded.parts || []);
          setFloorTiles(loaded.floorTiles || {});
        }
        showToast("Machine Loaded");
        changeMode(AppMode.CONSTRUCTION);
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
    setFloorTiles({});
    setIsClearConfirmOpen(false);
    showToast("Workspace Cleared");
  };

  const moveAll = (dir: 'up' | 'down') => {
    if (dir === 'down') {
      const isTouchingFloor = parts.some(p => {
        const cells = getOccupiedCells(p);
        return cells.some(c => c[1] <= 0);
      });

      if (isTouchingFloor) {
        showToast("Unable to lower your construction, some blocks are already touching the floor");
        return;
      }
    }

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
    const cam = cameraRef.current;

    if (axisIdx === 2) {
      axis.set(0, 1, 0);
    } else {
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

    setTemporaryRotationAxis(axisIdx);
    if (axisTimeoutRef.current) clearTimeout(axisTimeoutRef.current);
    axisTimeoutRef.current = setTimeout(() => {
      setTemporaryRotationAxis(null);
    }, 1000);
  };

  const handleSelectPartType = (type: PartType) => {
    setSelectedPartType(type);
    if (selectedFace) {
      setSelectedFace(null);
      showToast("Attachment Face Reset");
    }
  };

  const handleResetSimulation = useCallback(() => {
    setIsResetting(true);
    setIsPaused(false);
    showToast("Simulation Reset");
    setTimeout(() => {
      setSimulationKey(prev => prev + 1);
      setIsResetting(false);
    }, 50);
  }, []);

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
  }, [currentRotation, mode, editingPartId, undo, parts]);

  useEffect(() => {
    if (!context) {
      return;
    }

    updateContextSensors(parts, context);
    subscribeToContextStateChanges(context, parts, setParts, setMode);
  }, [parts, context]);

  const editingPart = parts.find(p => p.id === editingPartId);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <CameraReporter onUpdate={(cam) => cameraRef.current = cam} />
        <KeyboardCameraControls controlsRef={controlsRef} isDragging={isDragging} />

        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {!isResetting && (
          <Physics key={simulationKey} gravity={[0, -9.81, 0]} paused={isPaused || mode !== AppMode.PLAY}>
            <Scene
              mode={mode}
              paintMode={paintMode}
              playTool={playTool}
              parts={parts}
              floorTiles={floorTiles}
              onAddPart={addPart}
              onRemovePart={removePart}
              onEditPart={setEditingPartId}
              onPaintPart={paintPart}
              selectedPartType={selectedPartType}
              selectedFace={selectedFace}
              currentRotation={currentRotation}
              currentPaint={currentPaint}
              hoveredRotationAxis={hoveredRotationAxis}
              temporaryRotationAxis={temporaryRotationAxis}
              setIsDragging={setIsDragging}
            />
          </Physics>
        )}

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enabled={mode !== AppMode.FACE_PICKER && mode !== AppMode.LIBRARY && !isDragging}
          // enableKeys={false}
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
        onSelectType={handleSelectPartType}
        mode={mode}
        partCount={parts.length}
        recentPartTypes={recentPartTypes}
      />

      <PaintPanel
        currentPaint={currentPaint}
        onSelectPaint={(t, v) => setCurrentPaint(prev => ({ ...prev, [t]: v }))}
        mode={mode}
        recentColors={recentColors}
        paintMode={paintMode}
        setPaintMode={setPaintMode}
      />

      {mode === AppMode.LIBRARY && (
        <LibraryPanel
          onSave={saveMachine}
          onLoad={loadMachine}
          onClose={() => changeMode(AppMode.CONSTRUCTION)}
          partCount={parts.length}
        />
      )}

      <ControlHUD
        mode={mode}
        setMode={changeMode}
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
        toggleFacePicker={() => changeMode(mode === AppMode.FACE_PICKER ? AppMode.CONSTRUCTION : AppMode.FACE_PICKER)}
        selectedFace={selectedFace}
        onReset={handleResetSimulation}
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
            changeMode(AppMode.CONSTRUCTION);
            showToast("Attachment Point Set");
          }}
          onClose={() => changeMode(AppMode.CONSTRUCTION)}
          onClear={() => {
            setSelectedFace(null);
            changeMode(AppMode.CONSTRUCTION);
            showToast("Attachment Mode Disabled");
          }}
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

