
import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PartType, SelectedFace, AppMode } from '../types';
import PartMesh from './PartMesh';
import { X, CheckCircle2 } from 'lucide-react';

interface FacePickerOverlayProps {
  type: PartType;
  selectedFace: SelectedFace | null;
  onSelectFace: (face: SelectedFace) => void;
  onClose: () => void;
}

const FacePickerScene: React.FC<{
  type: PartType;
  selectedFace: SelectedFace | null;
  onSelectFace: (face: SelectedFace) => void;
}> = ({ type, selectedFace, onSelectFace }) => {
  const { raycaster, camera, mouse } = useThree();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const hit = e.intersections[0];
    if (!hit) return;

    const normal = hit.face.normal.clone();
    
    // For long blocks, we need to find the specific segment
    let offsetPos = [0, 0, 0] as [number, number, number];
    const normalArr = [Math.round(normal.x), Math.round(normal.y), Math.round(normal.z)] as [number, number, number];
    
    // Determine local position offset
    if (type === PartType.BLOCK_LONG) {
      // Long block is 1x1x3 along Z axis
      const lp = hit.point;
      // Snap Z to -1, 0, 1
      const sz = Math.round(lp.z);
      
      if (Math.abs(normal.z) > 0.5) {
        // Ends
        offsetPos = [0, 0, normal.z > 0 ? 1.5 : -1.5];
      } else {
        // Sides
        offsetPos = [normal.x * 0.5, normal.y * 0.5, sz];
      }
    } else {
      // Standard 1x1x1
      offsetPos = [normalArr[0] * 0.5, normalArr[1] * 0.5, normalArr[2] * 0.5];
    }

    onSelectFace({
      normal: normalArr,
      offset: offsetPos
    });
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={50} />
      <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={10} />
      <Environment preset="city" />
      
      <group onPointerDown={handlePointerDown}>
        <PartMesh 
          type={type} 
          mode={AppMode.FACE_PICKER} 
          selectedFace={selectedFace}
          isHighlighted={false} 
        />
      </group>
      
      <gridHelper args={[10, 10, '#334155', '#1e293b']} position={[0, -2, 0]} />
    </>
  );
};

const FacePickerOverlay: React.FC<FacePickerOverlayProps> = ({ type, selectedFace, onSelectFace, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* Header UI */}
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Face Inspection</h2>
          <p className="text-sm text-slate-400 mt-1">Rotate the part and click any face to use it as the attachment point.</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedFace && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 animate-in zoom-in-95 duration-200">
              <CheckCircle2 size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Face Locked</span>
            </div>
          )}
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={50} />
          <FacePickerScene type={type} selectedFace={selectedFace} onSelectFace={onSelectFace} />
        </Canvas>

        {/* Floating Instruction */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none text-center space-y-2">
          <div className="px-6 py-3 bg-slate-900/80 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              {selectedFace ? 'Selected attachment point confirmed' : 'Select an attachment face to proceed'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Confirm */}
      <div className="p-8 border-t border-white/5 bg-slate-950/50 flex justify-center">
        <button
          onClick={onClose}
          className="px-16 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3"
        >
          {selectedFace ? 'CONFIRM ATTACHMENT' : 'RETURN TO ASSEMBLY'}
        </button>
      </div>
    </div>
  );
};

export default FacePickerOverlay;
