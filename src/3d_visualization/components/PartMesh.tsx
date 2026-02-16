import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PartType, AppMode, SelectedFace } from '../types';
import { PART_DEFINITIONS } from '../constants';
import { Edges, RoundedBox, Cylinder, Box } from '@react-three/drei';

interface PartMeshProps {
  type: PartType;
  mode?: AppMode;
  isGhost?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isSetting?: boolean;
  customColor?: string;
  customFinish?: 'matte' | 'glossy' | 'metallic' | 'neon';
  settings?: any;
  subPart?: 'plate' | 'tire';
  lightOn?: boolean; 
  selectedFace?: SelectedFace | null;
}

const PartMesh: React.FC<PartMeshProps> = ({ 
  type, mode, isGhost, isSelected, isHighlighted, isSetting, customColor, customFinish, settings, subPart, lightOn = true, selectedFace
}) => {
  const definition = PART_DEFINITIONS.find(d => d.type === type);
  const baseColor = isSetting ? '#fbbf24' : (customColor || definition?.color || '#ffffff');
  
  // Materials
  const material = useMemo(() => {
    const params: THREE.MeshStandardMaterialParameters = {
      color: baseColor,
      transparent: isGhost,
      opacity: isGhost ? 0.4 : 1,
    };

    if (customFinish === 'glossy') {
      params.roughness = 0.1;
      params.metalness = 0.2;
    } else if (customFinish === 'metallic') {
      params.roughness = 0.2;
      params.metalness = 0.8;
    } else if (customFinish === 'neon') {
      params.emissive = new THREE.Color(baseColor);
      params.emissiveIntensity = isGhost ? 0.5 : 1;
    } else {
      params.roughness = 0.8;
      params.metalness = 0.1;
    }

    return new THREE.MeshStandardMaterial(params);
  }, [baseColor, isGhost, customFinish]);

  const highlightMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#60a5fa', wireframe: true, transparent: true, opacity: 0.5 }), []);
  
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569', metalness: 0.8, roughness: 0.2, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const darkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b', roughness: 0.9, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const indicatorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: '#94a3b8', emissive: '#94a3b8', emissiveIntensity: 0.5, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const emissiveMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: settings?.lightColor || '#ffffff', 
    emissive: settings?.lightColor || '#ffffff', 
    emissiveIntensity: lightOn ? (settings?.lightIntensity ? settings.lightIntensity / 100 : 2) : 0,
    transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [settings?.lightColor, settings?.lightIntensity, lightOn, isGhost]);

  // Wedge Geometry
  const wedgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.5);
    shape.lineTo(0.5, -0.5);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(-0.5, -0.5);
    
    const extrudeSettings = {
      steps: 1,
      depth: 1,
      bevelEnabled: false,
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  const renderPart = () => {
    switch (type) {
      case PartType.BLOCK:
        return (
          <RoundedBox args={[1, 1, 1]} radius={0.02} smoothness={4}>
             <primitive object={material} />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );
      
      case PartType.BLOCK_LONG:
        return (
          <RoundedBox args={[1, 1, 3]} radius={0.02} smoothness={4}>
             <primitive object={material} />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );

      case PartType.WEDGE:
        return (
           <mesh geometry={wedgeGeometry}>
             <primitive object={material} />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
           </mesh>
        );

      case PartType.MOTOR:
        return (
          <group>
            {/* Stator (Body) - Occupies back half of cell */}
            <RoundedBox args={[0.9, 0.9, 0.6]} position={[0, 0, -0.2]} radius={0.05}>
              <primitive object={material} />
              <Edges threshold={15} color="#000000" opacity={0.2} transparent />
            </RoundedBox>
            
            {/* Rotor (Disk) */}
            <group position={[0, 0, 0.35]}>
               <Cylinder args={[0.35, 0.35, 0.15, 32]} rotation={[Math.PI / 2, 0, 0]}>
                 <primitive object={metalMaterial} />
               </Cylinder>
               
               {/* Flush Indicator Strip */}
               <Box args={[0.1, 0.5, 0.02]} position={[0, 0, 0.076]}>
                 <primitive object={indicatorMaterial} />
               </Box>
            </group>
            
            {/* Connector Axle (internal/visual only) */}
            <Cylinder args={[0.1, 0.1, 0.25, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]}>
              <primitive object={darkMaterial} />
            </Cylinder>
          </group>
        );

      case PartType.WHEEL:
        if (subPart === 'tire') {
           return (
             <group rotation={[Math.PI / 2, 0, 0]}>
               <Cylinder args={[0.85, 0.85, 0.4, 32]}>
                 <primitive object={darkMaterial} />
               </Cylinder>
               <Cylinder args={[0.5, 0.5, 0.41, 32]}>
                  <primitive object={metalMaterial} />
               </Cylinder>
             </group>
           )
        }
        if (subPart === 'plate') {
           return (
             <Box args={[0.8, 0.8, 0.1]} position={[0, 0, -0.45]}>
               <primitive object={material} />
             </Box>
           )
        }
        // Preview / Full mesh
        return (
          <group>
             <Box args={[0.8, 0.8, 0.1]} position={[0, 0, -0.45]}>
               <primitive object={material} />
             </Box>
             <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
               <Cylinder args={[0.85, 0.85, 0.4, 32]}>
                 <primitive object={darkMaterial} />
               </Cylinder>
               <Cylinder args={[0.5, 0.5, 0.41, 32]}>
                  <primitive object={metalMaterial} />
               </Cylinder>
             </group>
          </group>
        );

      case PartType.JOINT:
        return (
          <group>
            <Box args={[0.6, 0.6, 0.6]}>
               <primitive object={material} />
            </Box>
            <Cylinder args={[0.3, 0.3, 0.8, 16]} rotation={[0, 0, Math.PI / 2]}>
               <primitive object={metalMaterial} />
            </Cylinder>
            <Cylinder args={[0.4, 0.4, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
               <primitive object={darkMaterial} />
            </Cylinder>
             <Cylinder args={[0.4, 0.4, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} position={[-0.4, 0, 0]}>
               <primitive object={darkMaterial} />
            </Cylinder>
          </group>
        );
        
      case PartType.STABILIZER:
        return (
          <RoundedBox args={[1, 1, 1]} radius={0.05}>
             <primitive object={metalMaterial} />
             <Box args={[0.8, 0.8, 1.02]}>
                <meshStandardMaterial color="#334155" />
             </Box>
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );

      case PartType.LIGHT:
        return (
          <group>
            <Box args={[0.8, 0.8, 0.5]} position={[0, 0, -0.25]}>
              <primitive object={material} />
            </Box>
            <Cylinder args={[0.3, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
              <primitive object={darkMaterial} />
            </Cylinder>
            <Cylinder args={[0.25, 0.25, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
              <primitive object={emissiveMaterial} />
            </Cylinder>
            {lightOn && !isGhost && (
              <spotLight 
                position={[0, 0, 0.3]} 
                angle={0.6} 
                penumbra={0.5} 
                intensity={settings?.lightIntensity || 10} 
                color={settings?.lightColor || '#ffffff'} 
                distance={50}
                castShadow
              />
            )}
          </group>
        );

      case PartType.THRUSTER:
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
             <Cylinder args={[0.3, 0.4, 0.5, 32]} position={[0, 0.25, 0]}>
               <primitive object={material} />
             </Cylinder>
             <Cylinder args={[0.4, 0.2, 0.5, 32]} position={[0, -0.25, 0]}>
               <primitive object={metalMaterial} />
             </Cylinder>
             {settings?.force > 0 && !isGhost && (
               <pointLight position={[0, -0.6, 0]} color="orange" intensity={2} distance={3} />
             )}
          </group>
        );

      default:
        return <Box args={[1, 1, 1]}><primitive object={material} /></Box>;
    }
  };

  return (
    <group>
      {renderPart()}
      {(isHighlighted || isSelected) && !isGhost && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} /> 
          <primitive object={highlightMaterial} />
        </mesh>
      )}
      {/* Face Selection Highlight */}
      {selectedFace && (
        <group position={new THREE.Vector3(...selectedFace.offset)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(...selectedFace.normal))}>
             <mesh position={[0, 0, 0.01]}>
               <planeGeometry args={[0.8, 0.8]} />
               <meshBasicMaterial color="#10b981" transparent opacity={0.5} side={THREE.DoubleSide} />
             </mesh>
        </group>
      )}
    </group>
  );
};

export default PartMesh;