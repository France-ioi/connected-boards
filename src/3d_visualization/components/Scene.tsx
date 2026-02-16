
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { AppMode, PartData, PartType, PlayTool, SelectedFace } from '../types';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { Line } from '@react-three/drei';
import PartMesh from './PartMesh';
import PlayMachine from './PlayMachine';

interface SceneProps {
  mode: AppMode;
  playTool?: PlayTool;
  parts: PartData[];
  onAddPart: (pos: [number, number, number], normal: [number, number, number], autoRotation: [number, number, number, number]) => void;
  onRemovePart: (id: string) => void;
  onEditPart: (id: string) => void;
  onPaintPart: (id: string) => void;
  selectedPartType: PartType;
  selectedFace: SelectedFace | null;
  currentRotation: [number, number, number, number];
  currentPaint: { color?: string; finish?: string };
  hoveredRotationAxis: number | null;
}

const getOccupiedCells = (part: { type: PartType, position: [number, number, number], rotation: [number, number, number, number] }): [number, number, number][] => {
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

const Scene: React.FC<SceneProps> = ({ 
  mode, 
  playTool,
  parts, 
  onAddPart, 
  onRemovePart, 
  onEditPart, 
  onPaintPart,
  selectedPartType, 
  selectedFace,
  currentRotation,
  currentPaint,
  hoveredRotationAxis
}) => {
  const { camera, raycaster, mouse, scene } = useThree();
  const [hoverTarget, setHoverTarget] = useState<{ pos: [number, number, number], normal: [number, number, number], isFloor: boolean } | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const ghostGroupRef = useRef<THREE.Group>(null);
  const axisGroupRef = useRef<THREE.Group>(null);
  const pointerDownPos = useRef<{ x: number, y: number } | null>(null);
  
  const visualRotation = useRef(new THREE.Quaternion(...currentRotation));
  const targetRotation = useRef(new THREE.Quaternion(...currentRotation));
  const visualPosition = useRef(new THREE.Vector3());
  
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5), []);

  const findValidHit = useCallback((intersections: THREE.Intersection[]) => {
    return intersections.find(hit => {
      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData.isGhost) return false;
        curr = curr.parent;
      }
      return true;
    });
  }, []);

  const getTargetFromHit = useCallback((hit: THREE.Intersection) => {
    if (!hit) return null;
    let partRoot: THREE.Object3D | null = hit.object;
    while (partRoot && !partRoot.userData.partId) partRoot = partRoot.parent;
    const isFloorMesh = hit.object.name === 'visual-floor';

    if (!partRoot || isFloorMesh) {
      const targetPos = new THREE.Vector3(Math.round(hit.point.x), -1, Math.round(hit.point.z));
      return { 
        pos: [targetPos.x, targetPos.y, targetPos.z] as [number, number, number], 
        normal: [0, 1, 0] as [number, number, number], 
        isFloor: true 
      };
    }

    const partData = parts.find(p => p.id === partRoot!.userData.partId);
    let targetPos = partRoot.position.clone();

    if (partData && partData.type === PartType.BLOCK_LONG) {
      const localHit = partRoot.worldToLocal(hit.point.clone());
      targetPos = partRoot.localToWorld(new THREE.Vector3(0, 0, Math.round(localHit.z)));
    }

    const hitFace = hit.face;
    if (!hitFace) return null;

    const worldNormal = hitFace.normal.clone().applyQuaternion(partRoot.quaternion).normalize();
    return { 
      pos: [Math.round(targetPos.x), Math.round(targetPos.y), Math.round(targetPos.z)] as [number, number, number], 
      normal: [Math.round(worldNormal.x), Math.round(worldNormal.y), Math.round(worldNormal.z)] as [number, number, number], 
      isFloor: false 
    };
  }, [parts]);

  const rawPlacementRotation = useMemo(() => {
    if (!hoverTarget || !selectedFace) return currentRotation;
    const qUser = new THREE.Quaternion(...currentRotation);
    const nLocal = new THREE.Vector3(...selectedFace.normal);
    const nTargetWorld = new THREE.Vector3(...hoverTarget.normal).negate();
    const nUserWorld = nLocal.clone().applyQuaternion(qUser);
    const qAlign = new THREE.Quaternion().setFromUnitVectors(nUserWorld, nTargetWorld);
    const qFinal = qUser.clone().premultiply(qAlign);
    return [qFinal.x, qFinal.y, qFinal.z, qFinal.w] as [number, number, number, number];
  }, [currentRotation, hoverTarget, selectedFace]);

  const placementData = useMemo(() => {
    if (!hoverTarget) return null;

    let basePos = new THREE.Vector3(
      Math.round(hoverTarget.pos[0] + (selectedFace ? 0 : hoverTarget.normal[0])),
      Math.round(hoverTarget.pos[1] + (selectedFace ? 0 : hoverTarget.normal[1])),
      Math.round(hoverTarget.pos[2] + (selectedFace ? 0 : hoverTarget.normal[2]))
    );

    const occupiedByExisting = new Set(parts.flatMap(p => 
      getOccupiedCells(p).map(c => `${c[0]},${c[1]},${c[2]}`)
    ));

    let isValid = false;
    let iterations = 0;
    while (iterations < 20) {
      const cells = getOccupiedCells({
        type: selectedPartType,
        position: [basePos.x, basePos.y, basePos.z],
        rotation: rawPlacementRotation
      });
      const isClippingFloor = cells.some(c => c[1] < 0);
      const isOverlapping = cells.some(c => occupiedByExisting.has(`${c[0]},${c[1]},${c[2]}`));
      if (!isClippingFloor && !isOverlapping) {
        isValid = true;
        break;
      }
      basePos.y += 1;
      iterations++;
    }

    return {
      pos: [basePos.x, basePos.y, basePos.z] as [number, number, number],
      isValid,
      rotation: rawPlacementRotation
    };
  }, [hoverTarget, parts, selectedPartType, rawPlacementRotation, selectedFace]);

  useFrame((state, delta) => {
    // 1. Position and Rotation Interpolation
    if (placementData && ghostGroupRef.current) {
      targetRotation.current.set(...placementData.rotation);
      visualRotation.current.slerp(targetRotation.current, Math.min(1.0, delta * 15));
      ghostGroupRef.current.quaternion.copy(visualRotation.current);

      let targetPos = new THREE.Vector3(...placementData.pos);
      
      // Presentation Mode: Move ghost to center of screen when hovering rotation buttons
      // Keep normal size by pushing it away from camera
      if (hoveredRotationAxis !== null) {
        const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        targetPos.copy(camera.position).add(camDir.multiplyScalar(12));
      }

      visualPosition.current.lerp(targetPos, Math.min(1.0, delta * 15));
      ghostGroupRef.current.position.copy(visualPosition.current);

      // Move the axis group to the same position
      if (axisGroupRef.current) {
        axisGroupRef.current.position.copy(visualPosition.current);
      }
    }

    // 2. Interaction Raycasting
    if (mode === AppMode.CONSTRUCTION || mode === AppMode.DELETE || mode === AppMode.PAINT || mode === AppMode.SETTINGS) {
      raycaster.setFromCamera(mouse, camera);
      if (mode === AppMode.CONSTRUCTION) {
        const intersects = raycaster.intersectObjects(scene.children, true);
        const validHit = findValidHit(intersects);
        if (validHit) {
          setHoverTarget(getTargetFromHit(validHit));
        } else {
          const groundPoint = new THREE.Vector3();
          if (raycaster.ray.intersectPlane(floorPlane, groundPoint)) {
            setHoverTarget({ pos: [Math.round(groundPoint.x), -1, Math.round(groundPoint.z)], normal: [0, 1, 0], isFloor: true });
          } else {
            setHoverTarget(null);
          }
        }
      } else {
        const intersects = raycaster.intersectObjects(scene.children, true);
        const validHit = findValidHit(intersects);
        let foundId = null;
        if (validHit) {
          let curr: THREE.Object3D | null = validHit.object;
          while (curr && !curr.userData.partId) curr = curr.parent;
          if (curr) foundId = curr.userData.partId;
        }
        setHoveredPartId(foundId);
      }
    }
  });

  const handlePointerDown = (e: any) => {
    if (e.button !== 0) return; 
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: any) => {
    if (e.button !== 0 || !pointerDownPos.current) return;
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pointerDownPos.current = null;
    if (dist > 5) return;

    if (mode === AppMode.CONSTRUCTION && placementData?.isValid && hoverTarget) {
      onAddPart(placementData.pos, hoverTarget.normal, placementData.rotation);
    } else if (mode === AppMode.DELETE && hoveredPartId) {
      onRemovePart(hoveredPartId);
    } else if (mode === AppMode.PAINT && hoveredPartId) {
      onPaintPart(hoveredPartId);
    } else if (mode === AppMode.SETTINGS && hoveredPartId) {
      onEditPart(hoveredPartId);
    }
  };

  // Calculate the visual axis points based on camera orientation and grid snapping
  const axisPoints = useMemo(() => {
    if (hoveredRotationAxis === null) return null;

    let axisVec = new THREE.Vector3();

    if (hoveredRotationAxis === 2) {
      // Z Button: Perpendicular to floor (World Y)
      axisVec.set(0, 1, 0);
    } else {
      // Determine which grid axis is most horizontal relative to camera
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const worldUp = new THREE.Vector3(0, 1, 0);
      const camRight = new THREE.Vector3().crossVectors(camDir, worldUp).normalize();
      
      const worldX = new THREE.Vector3(1, 0, 0);
      const worldZ = new THREE.Vector3(0, 0, 1);
      
      const dotX = Math.abs(camRight.dot(worldX));
      const dotZ = Math.abs(camRight.dot(worldZ));
      
      const mostHorizontal = dotX > dotZ ? worldX : worldZ;
      const otherAxis = dotX > dotZ ? worldZ : worldX;
      
      if (hoveredRotationAxis === 0) {
        axisVec.copy(mostHorizontal);
      } else {
        axisVec.copy(otherAxis);
      }
    }

    const p1 = axisVec.clone().multiplyScalar(-5);
    const p2 = axisVec.clone().multiplyScalar(5);
    return [p1, p2] as [THREE.Vector3, THREE.Vector3];
  }, [hoveredRotationAxis, camera, camera.rotation, camera.position]); 

  return (
    <group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      {/* Existing parts */}
      {mode !== AppMode.PLAY && parts.map(p => (
        <group key={p.id} position={p.position} quaternion={new THREE.Quaternion(...p.rotation)} userData={{ partId: p.id }}>
          <PartMesh 
            type={p.type} 
            mode={mode}
            isHighlighted={hoveredPartId === p.id}
            isSelected={false}
            customColor={p.customColor}
            customFinish={p.customFinish}
            settings={p.settings}
          />
        </group>
      ))}

      {/* Construction Ghost */}
      {mode === AppMode.CONSTRUCTION && placementData && (
        <>
          <group ref={ghostGroupRef} userData={{ isGhost: true }}>
            <PartMesh 
              type={selectedPartType} 
              isGhost={true} 
              customColor={placementData.isValid ? (currentPaint.color || '#3b82f6') : '#ef4444'} 
              customFinish={currentPaint.finish as any}
            />
          </group>

          {/* Yellow Dotted Axis Indicator - Separate group to avoid rotation */}
          {hoveredRotationAxis !== null && axisPoints && (
            <group ref={axisGroupRef}>
              <Line
                points={axisPoints}
                color="yellow"
                lineWidth={2}
                dashed
                dashScale={10}
                dashSize={0.5}
                gapSize={0.5}
              />
            </group>
          )}
        </>
      )}

      {/* Physics Simulation */}
      {mode === AppMode.PLAY && <PlayMachine parts={parts} />}

      {/* Visual Floor Surface */}
      <mesh name="visual-floor" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.8} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Physics Floor Collider */}
      <RigidBody type="fixed" position={[0, -0.55, 0]}>
        <CuboidCollider args={[500, 0.05, 500]} friction={1} restitution={0.2} />
      </RigidBody>
    </group>
  );
};

export default Scene;
