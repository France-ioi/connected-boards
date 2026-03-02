
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { PartType } from '../types';
import PartMesh from './PartMesh';
import * as THREE from 'three';

interface PartPreviewProps {
  type: PartType;
  rotation: [number, number, number, number];
}

const PartPreview: React.FC<PartPreviewProps> = ({ type, rotation }) => {
  return (
    <div className="w-40 h-40 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative flex flex-col pointer-events-auto">
      <div className="absolute top-3 left-0 right-0 text-center pointer-events-none z-10">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
          Ready to Build
        </span>
      </div>
      
      <div className="flex-1 w-full">
        <Canvas 
          shadows 
          camera={{ position: [2.5, 2.5, 2.5], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Lighting to match main scene direction and feel */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 7.5, 2.5]} intensity={50} castShadow />
          <pointLight position={[-2, 1, -2]} intensity={10} color="#3b82f6" />
          
          <Suspense fallback={null}>
            <Environment preset="city" />
            <group 
              quaternion={new THREE.Quaternion(...rotation)}
            >
              <PartMesh type={type} />
            </group>
          </Suspense>
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial transparent opacity={0.1} color="#000" />
          </mesh>
        </Canvas>
      </div>

      <div className="absolute bottom-3 left-0 right-0 text-center z-10">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
          Current Piece
        </p>
      </div>
    </div>
  );
};

export default PartPreview;
