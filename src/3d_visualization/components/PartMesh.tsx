
import React, {useMemo, useRef, useState, useEffect, Suspense, useContext} from 'react';
import * as THREE from 'three';
import {PartType, AppMode, SelectedFace, PartData} from '../types';
import { PART_DEFINITIONS } from '../constants';
import { Edges, RoundedBox, Cylinder, Box, Text, Circle, Line } from '@react-three/drei';
import { useRapier } from '@react-three/rapier'; 
import { useFrame, useThree } from '@react-three/fiber';
import {changePartState} from "../3d_interface";
import {QuickalgoContext} from "../QuickalgoContext";

interface PartMeshProps {
  part?: PartData,
  type: PartType;
  mode?: AppMode;
  isGhost?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isSetting?: boolean;
  customColor?: string;
  customFinish?: 'matte' | 'glossy' | 'metallic' | 'neon';
  faceColors?: { [faceIndex: number]: string };
  settings?: any;
  subPart?: 'plate' | 'tire';
  lightOn?: boolean; 
  selectedFace?: SelectedFace | null;
  highlightedFace?: SelectedFace | null;
  onRotorRef?: (el: THREE.Group | null) => void;
}

// Active sensor component that performs raycasting
const SensorRaycaster: React.FC<{part: PartData}> = ({part}) => {
  const { world, rapier } = useRapier();
  const { scene } = useThree(); 
  const textRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const hitDotRef = useRef<THREE.Mesh>(null);
  const lastUpdate = useRef<number>(0);
  
  const visualRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const context = useContext(QuickalgoContext);

  useFrame((state) => {
    if (!groupRef.current || !textRef.current || !world || !rapier || !beamRef.current || !hitDotRef.current) return;

    // Run update every 50ms for performance
    const now = state.clock.elapsedTime * 1000;
    if (now - lastUpdate.current < 50) return;
    lastUpdate.current = now;

    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    
    groupRef.current.getWorldPosition(worldPos);
    groupRef.current.getWorldQuaternion(worldQuat);

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat).normalize();
    
    // Physics Ray: Start outside (0.55) to avoid self-collision if solid
    const physStartOffset = 0.55;
    const physOrigin = worldPos.clone().add(forward.clone().multiplyScalar(physStartOffset));
    
    // Visual Ray: Start inside (0.1) to catch adjacent faces at 0.5
    // We start deep inside to ensure we are "in front" of the adjacent block's face for the raycaster
    const visStartOffset = 0.1;
    const visOrigin = worldPos.clone().add(forward.clone().multiplyScalar(visStartOffset));

    const maxDist = 10.0;
    let closestDistFromFace = maxDist;
    let hasHit = false;

    // 1. Physics Raycast
    const ray = new rapier.Ray(
      { x: physOrigin.x, y: physOrigin.y, z: physOrigin.z }, 
      { x: forward.x, y: forward.y, z: forward.z }
    );
    const physHit = world.castRay(ray, maxDist, true); // solid=true detects overlap
    
    if (physHit && physHit.toi < maxDist) {
       // Physics Hit Distance is from 0.55.
       // Dist from face (0.5) = toi + 0.05
       const d = physHit.toi + (physStartOffset - 0.5);
       if (d < closestDistFromFace) {
         closestDistFromFace = d;
         hasHit = true;
       }
    }

    // 2. Visual Raycast (Fallback & Adjacent Detection)
    visualRaycaster.set(visOrigin, forward);
    visualRaycaster.far = maxDist;
    const visualHits = visualRaycaster.intersectObjects(scene.children, true);
    
    const validVisualHit = visualHits.find(hit => {
       if (hit.object.userData.ignoreRaycast) return false;
       if (hit.object.name === 'visual-floor') return true;
       
       // Ignore self
       let curr: THREE.Object3D | null = hit.object;
       while (curr) {
          if (curr === groupRef.current) return false;
          if (curr.userData.isGhost) return false;
          curr = curr.parent;
       }
       return true;
    });

    if (validVisualHit) {
       // Visual Hit Distance is from 0.1.
       // Dist from face (0.5) = distance - 0.4
       const d = validVisualHit.distance - (0.5 - visStartOffset);
       // Check validity: if d < -0.01, we hit something inside the sensor (should be ignored by loop above, but safety check)
       if (d >= -0.01 && d < closestDistFromFace) {
          closestDistFromFace = Math.max(0, d);
          hasHit = true;
       }
    }

    // Update Visuals (Imperative, no React Render)
    const displayDist = hasHit ? closestDistFromFace : maxDist;
    const beamStart = 0.51; // Start beam just outside face
    
    // Scale Y of cylinder (default up axis), rotated to Z
    beamRef.current.scale.set(1, displayDist, 1);
    // Position: Center of cylinder is start + len/2
    beamRef.current.position.set(0, 0, beamStart + displayDist / 2);
    beamRef.current.visible = true;
    
    (beamRef.current.material as THREE.MeshBasicMaterial).color.set(hasHit ? '#22c55e' : '#ef4444');
    (beamRef.current.material as THREE.MeshBasicMaterial).opacity = hasHit ? 0.6 : 0.2;

    // Hit Dot
    hitDotRef.current.position.set(0, 0, beamStart + displayDist);
    hitDotRef.current.visible = hasHit;

    // Text Update
    if (hasHit) {
       const val = Math.floor(closestDistFromFace * 10);
       changePartState(context, part, Math.min(500, val));
       if (val < 100) {
         textRef.current.text = val.toString().padStart(2, '0');
       } else {
         textRef.current.text = 'XX';
       }
    } else {
       textRef.current.text = '--';
       changePartState(context, part, 500);
    }
  });

  return (
    <group ref={groupRef}>
      <Text 
        ref={textRef}
        position={[0, 0.51, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
        characters="0123456789X-"
      >
        --
      </Text>
      
      {/* Ray Beam (Cylinder along Z) */}
      <mesh ref={beamRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.51]} userData={{ ignoreRaycast: true }}>
         <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
         <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
      </mesh>

      {/* Hit Indicator */}
      <mesh ref={hitDotRef} visible={false} userData={{ ignoreRaycast: true }}>
         <sphereGeometry args={[0.08]} />
         <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
};

const PartMesh: React.FC<PartMeshProps> = ({ 
  part, type, mode, isGhost, isSelected, isHighlighted, isSetting, customColor, customFinish, faceColors, settings, subPart, lightOn = true, selectedFace, highlightedFace, onRotorRef
}) => {
  const definition = PART_DEFINITIONS.find(d => d.type === type);
  const baseColor = isSetting ? '#fbbf24' : (customColor || definition?.color || '#ffffff');
  
  // Create material function to reuse for faces
  const createMaterial = (color: string) => {
    const params: THREE.MeshStandardMaterialParameters = {
      color: color,
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
      params.emissive = new THREE.Color(color);
      params.emissiveIntensity = isGhost ? 0.5 : 1;
    } else {
      params.roughness = 0.8;
      params.metalness = 0.1;
    }

    return new THREE.MeshStandardMaterial(params);
  };

  // Base Material
  const material = useMemo(() => createMaterial(baseColor), [baseColor, isGhost, customFinish]);

  // Face Materials (Array of 6)
  // Order: +x (0), -x (1), +y (2), -y (3), +z (4), -z (5)
  const materials = useMemo(() => {
    if (!faceColors) return null;
    return [0, 1, 2, 3, 4, 5].map(i => {
      const c = faceColors[i];
      return c ? createMaterial(c) : material;
    });
  }, [faceColors, material]);

  const highlightMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#60a5fa', wireframe: true, transparent: true, opacity: 0.5 }), []);
  
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569', metalness: 0.8, roughness: 0.2, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const darkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b', roughness: 0.9, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const sensorDotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#000000', roughness: 0.2, metalness: 0.5, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const indicatorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.8, transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [isGhost]);

  const emissiveMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: settings?.lightColor || '#ffffff', 
    emissive: settings?.lightColor || '#ffffff', 
    emissiveIntensity: lightOn ? (settings?.lightIntensity ? settings.lightIntensity / 100 : 2) : 0,
    transparent: isGhost, opacity: isGhost ? 0.4 : 1
  }), [settings?.lightColor, settings?.lightIntensity, lightOn, isGhost]);

  const faceHighlightMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#34d399', 
    transparent: true, 
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthTest: false, 
    toneMapped: false 
  }), []);

  const hoverFaceMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff', 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthTest: false, 
    toneMapped: false 
  }), []);

  const faceBorderMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthTest: false,
    toneMapped: false
  }), []);

  const lightTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 1); 
    return o;
  }, []);

  const wedgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.5);
    shape.lineTo(0.5, -0.5);
    shape.lineTo(-0.5, 0.5);
    shape.lineTo(-0.5, -0.5);
    const extrudeSettings = { steps: 1, depth: 1, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  const renderPart = () => {
    switch (type) {
      case PartType.BLOCK:
        if (materials) {
           return (
             <Box args={[1, 1, 1]} material={materials}>
                <Edges threshold={15} color="#000000" opacity={0.2} transparent />
             </Box>
           );
        }
        return (
          <RoundedBox args={[1, 1, 1]} radius={0.02} smoothness={4}>
             <primitive object={material} attach="material" />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );
      
      case PartType.BLOCK_LONG:
        if (materials) {
           return (
             <Box args={[1, 1, 3]} material={materials}>
                <Edges threshold={15} color="#000000" opacity={0.2} transparent />
             </Box>
           );
        }
        return (
          <RoundedBox args={[1, 1, 3]} radius={0.02} smoothness={4}>
             <primitive object={material} attach="material" />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );

      case PartType.CYLINDER:
        return (
           <Cylinder args={[0.5, 0.5, 1, 32]}>
             <primitive object={material} attach="material" />
             <Edges threshold={30} color="#000000" opacity={0.2} transparent />
           </Cylinder>
        );

      case PartType.WEDGE:
        return (
           <mesh geometry={wedgeGeometry}>
             <primitive object={material} attach="material" />
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
           </mesh>
        );

      case PartType.MOTOR:
        return (
          <group>
            {/* Stator */}
            <RoundedBox args={[1, 1, 0.6]} position={[0, 0, -0.2]} radius={0.02} smoothness={4}>
              <primitive object={material} attach="material" />
              <Edges threshold={15} color="#000000" opacity={0.2} transparent />
            </RoundedBox>
            {/* Rotor */}
            <group position={[0, 0, 0.35]} ref={onRotorRef}>
               <Cylinder args={[0.35, 0.35, 0.15, 32]} rotation={[Math.PI / 2, 0, 0]}>
                 <primitive object={metalMaterial} attach="material" />
               </Cylinder>
               <Box args={[0.1, 0.6, 0.05]} position={[0, 0, 0.1]}>
                 <primitive object={indicatorMaterial} attach="material" />
               </Box>
            </group>
            <Cylinder args={[0.1, 0.1, 0.25, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]}>
              <primitive object={darkMaterial} attach="material" />
            </Cylinder>
          </group>
        );

      case PartType.WHEEL:
        if (subPart === 'tire') {
           return (
             <group rotation={[Math.PI / 2, 0, 0]}>
               <Cylinder args={[0.85, 0.85, 0.4, 32]}>
                 <primitive object={darkMaterial} attach="material" />
               </Cylinder>
               <Cylinder args={[0.5, 0.5, 0.41, 32]}>
                  <primitive object={metalMaterial} attach="material" />
               </Cylinder>
             </group>
           )
        }
        if (subPart === 'plate') {
           return (
             <Box args={[0.8, 0.8, 0.1]} position={[0, 0, -0.45]}>
               <primitive object={material} attach="material" />
             </Box>
           )
        }
        return (
          <group>
             <Box args={[0.8, 0.8, 0.1]} position={[0, 0, -0.45]}>
               <primitive object={material} attach="material" />
             </Box>
             <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
               <Cylinder args={[0.85, 0.85, 0.4, 32]}>
                 <primitive object={darkMaterial} attach="material" />
               </Cylinder>
               <Cylinder args={[0.5, 0.5, 0.41, 32]}>
                  <primitive object={metalMaterial} attach="material" />
               </Cylinder>
             </group>
          </group>
        );

      case PartType.JOINT:
        return (
          <group>
            <Box args={[0.6, 0.6, 0.6]}>
               <primitive object={material} attach="material" />
            </Box>
            <Cylinder args={[0.3, 0.3, 0.8, 16]} rotation={[0, 0, Math.PI / 2]}>
               <primitive object={metalMaterial} attach="material" />
            </Cylinder>
            <Cylinder args={[0.4, 0.4, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} position={[0.4, 0, 0]}>
               <primitive object={darkMaterial} attach="material" />
            </Cylinder>
             <Cylinder args={[0.4, 0.4, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} position={[-0.4, 0, 0]}>
               <primitive object={darkMaterial} attach="material" />
            </Cylinder>
          </group>
        );
        
      case PartType.STABILIZER:
        return (
          <RoundedBox args={[1, 1, 1]} radius={0.05}>
             <primitive object={metalMaterial} attach="material" />
             <Box args={[0.8, 0.8, 1.02]}>
                <meshStandardMaterial color="#334155" />
             </Box>
             <Edges threshold={15} color="#000000" opacity={0.2} transparent />
          </RoundedBox>
        );

      case PartType.LIGHT:
        return (
          <group>
            <RoundedBox args={[1, 1, 0.5]} position={[0, 0, -0.25]} radius={0.02} smoothness={4}>
              <primitive object={material} attach="material" />
              <Edges threshold={15} color="#000000" opacity={0.2} transparent />
            </RoundedBox>
            <Cylinder args={[0.3, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
              <primitive object={darkMaterial} attach="material" />
            </Cylinder>
            <Cylinder args={[0.25, 0.25, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
              <primitive object={emissiveMaterial} attach="material" />
            </Cylinder>
            {lightOn && !isGhost && (
              <>
                <primitive object={lightTarget} />
                <spotLight 
                  position={[0, 0, 0]} 
                  target={lightTarget} 
                  angle={0.6} 
                  penumbra={0.5} 
                  intensity={settings?.lightIntensity || 10} 
                  color={settings?.lightColor || '#ffffff'} 
                  distance={50}
                  castShadow
                />
              </>
            )}
          </group>
        );

      case PartType.THRUSTER:
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
             <Cylinder args={[0.3, 0.4, 0.5, 32]} position={[0, 0.25, 0]}>
               <primitive object={material} attach="material" />
             </Cylinder>
             <Cylinder args={[0.4, 0.2, 0.5, 32]} position={[0, -0.25, 0]}>
               <primitive object={metalMaterial} attach="material" />
             </Cylinder>
             {settings?.force > 0 && !isGhost && (
               <pointLight position={[0, -0.6, 0]} color="orange" intensity={2} distance={3} />
             )}
          </group>
        );

      case PartType.SENSOR:
        return (
          <group>
            <RoundedBox args={[1, 1, 1]} radius={0.02} smoothness={4}>
               <primitive object={material} attach="material" />
               <Edges threshold={15} color="#000000" opacity={0.2} transparent />
            </RoundedBox>
            
            {/* Sensor Dot on Front Face (+Z) */}
            <mesh position={[0, 0, 0.501]}>
              <circleGeometry args={[0.15, 32]} />
              <primitive object={sensorDotMaterial} attach="material" />
            </mesh>
            
            {/* Logic & Display */}
            {mode === AppMode.PLAY && !isGhost ? (
               <SensorRaycaster part={part}/>
            ) : (
              <Suspense fallback={null}>
                 <Text
                  position={[0, 0.51, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={0.8}
                  color="#ef4444"
                  anchorX="center"
                  anchorY="middle"
                  characters="0123456789X-"
                 >
                   X
                 </Text>
              </Suspense>
            )}
          </group>
        );

      default:
        return <Box args={[1, 1, 1]}><primitive object={material} attach="material" /></Box>;
    }
  };

  return (
    <group>
      {renderPart()}
      {(isHighlighted || isSelected) && !isGhost && (
        <mesh userData={{ ignoreRaycast: true }}>
          <boxGeometry args={[1.05, 1.05, 1.05]} /> 
          <primitive object={highlightMaterial} />
        </mesh>
      )}
      {selectedFace && (
        <group 
          position={new THREE.Vector3(...selectedFace.offset)} 
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(...selectedFace.normal))}
        >
             <mesh position={[0, 0, 0.015]} renderOrder={999} userData={{ ignoreRaycast: true }}>
               <planeGeometry args={[0.8, 0.8]} />
               <primitive object={faceHighlightMaterial} />
             </mesh>
             <mesh position={[0, 0, 0.02]} renderOrder={999} userData={{ ignoreRaycast: true }}>
                <ringGeometry args={[0.32, 0.35, 32]} />
                <primitive object={faceBorderMaterial} />
             </mesh>
             <mesh position={[0, 0, 0.02]} renderOrder={999} rotation={[0,0,0]} userData={{ ignoreRaycast: true }}>
                <planeGeometry args={[0.1, 0.1]} />
                <primitive object={faceBorderMaterial} />
             </mesh>
        </group>
      )}
      {highlightedFace && (
        <group 
          position={new THREE.Vector3(...highlightedFace.offset)} 
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(...highlightedFace.normal))}
        >
             <mesh position={[0, 0, 0.018]} renderOrder={1000} userData={{ ignoreRaycast: true }}>
               <planeGeometry args={[0.9, 0.9]} />
               <primitive object={hoverFaceMaterial} />
             </mesh>
        </group>
      )}
    </group>
  );
};

export default PartMesh;
