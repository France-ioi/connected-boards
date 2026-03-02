
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { AppMode, PartData, PartType, PlayTool, SelectedFace, FloorTileMap, PaintMode } from '../types';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { Line, Sphere } from '@react-three/drei';
import PartMesh from './PartMesh';
import PlayMachine from './PlayMachine';
import { v4 as uuidv4 } from 'uuid';

interface SceneProps {
  mode: AppMode;
  paintMode?: PaintMode;
  playTool?: PlayTool;
  parts: PartData[];
  floorTiles?: FloorTileMap;
  onAddPart: (pos: [number, number, number], normal: [number, number, number], autoRotation: [number, number, number, number]) => void;
  onRemovePart: (id: string) => void;
  onEditPart: (id: string) => void;
  onPaintPart: (id: string, hitNormal?: THREE.Vector3, isFloor?: boolean, hitPoint?: THREE.Vector3) => void;
  selectedPartType: PartType;
  selectedFace: SelectedFace | null;
  currentRotation: [number, number, number, number];
  currentPaint: { color?: string; finish?: string };
  hoveredRotationAxis: number | null;
  temporaryRotationAxis: number | null;
  setIsDragging: (dragging: boolean) => void;
}

interface ProjectileData {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  radius: number;
}

export interface DragState {
  isDragging: boolean;
  partId: string | null;
  hitPoint: THREE.Vector3 | null;
  targetPosition: THREE.Vector3 | null;
}

export interface PushState {
  isPushing: boolean;
  partId: string | null;
  hitPoint: THREE.Vector3 | null;
  forceDir: THREE.Vector3 | null;
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
  paintMode,
  playTool,
  parts, 
  floorTiles = {},
  onAddPart, 
  onRemovePart, 
  onEditPart, 
  onPaintPart,
  selectedPartType, 
  selectedFace,
  currentRotation,
  currentPaint,
  hoveredRotationAxis,
  temporaryRotationAxis,
  setIsDragging
}) => {
  const { camera, raycaster, mouse, scene, controls, gl } = useThree();
  const [hoverTarget, setHoverTarget] = useState<{ pos: [number, number, number], normal: [number, number, number], isFloor: boolean } | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [hoveredPaintFace, setHoveredPaintFace] = useState<{partId: string, face: SelectedFace} | null>(null);
  
  // Kick Tool State
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [kickChargeStart, setKickChargeStart] = useState<number | null>(null);
  const ghostBallRef = useRef<THREE.Mesh>(null);

  // Drag Tool State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    partId: null,
    hitPoint: null,
    targetPosition: null
  });

  // Push Tool State
  const [pushState, setPushState] = useState<PushState>({
    isPushing: false,
    partId: null,
    hitPoint: null,
    forceDir: null
  });
  
  // Refs for drag calculation
  const dragRef = useRef({
    active: false,
    targetPos: new THREE.Vector3(),
    mouseStart: new THREE.Vector2(),
    keys: { up: false, down: false, left: false, right: false }
  });

  const ghostGroupRef = useRef<THREE.Group>(null);
  const axisGroupRef = useRef<THREE.Group>(null);
  const pointerDownPos = useRef<{ x: number, y: number } | null>(null);
  
  const visualRotation = useRef(new THREE.Quaternion(...currentRotation));
  const targetRotation = useRef(new THREE.Quaternion(...currentRotation));
  const visualPosition = useRef(new THREE.Vector3());
  
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5), []);
  const prevHoveredPaintFace = useRef<{partId: string, face: SelectedFace} | null>(null);

  // --- Keyboard Listeners for Drag Panning ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') dragRef.current.keys.up = true;
      if (e.key === 'ArrowDown') dragRef.current.keys.down = true;
      if (e.key === 'ArrowLeft') dragRef.current.keys.left = true;
      if (e.key === 'ArrowRight') dragRef.current.keys.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') dragRef.current.keys.up = false;
      if (e.key === 'ArrowDown') dragRef.current.keys.down = false;
      if (e.key === 'ArrowLeft') dragRef.current.keys.left = false;
      if (e.key === 'ArrowRight') dragRef.current.keys.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // --- Mouse Listeners for Drag and Push ---
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;

      const sensitivity = 0.05; 
      const dy = -e.movementY;
      const upVec = new THREE.Vector3(0, 1, 0);
      const dx = e.movementX;
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();
      
      dragRef.current.targetPos.add(upVec.multiplyScalar(dy * sensitivity));
      dragRef.current.targetPos.add(camRight.multiplyScalar(dx * sensitivity));
    };

    const onMouseUp = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        setDragState(prev => ({ ...prev, isDragging: false }));
        setIsDragging(false);
        if (controls) (controls as any).enabled = true;
        document.exitPointerLock?.();
      }
      
      // Clear Push State
      if (pushState.isPushing) {
         setPushState(prev => ({ ...prev, isPushing: false }));
         setIsDragging(false); // Reset drag state to re-enable orbit controls
         if (controls) (controls as any).enabled = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [camera, controls, setIsDragging, pushState.isPushing]);

  const findValidHit = useCallback((intersections: THREE.Intersection[]) => {
    return intersections.find(hit => {
      // Ignore visual helper objects marked with ignoreRaycast
      if (hit.object.userData.ignoreRaycast) return false;

      let curr: THREE.Object3D | null = hit.object;
      while (curr) {
        if (curr.userData.isGhost) return false;
        if (curr.userData.ignoreRaycast) return false;
        curr = curr.parent;
      }
      return true;
    });
  }, []);

  // --- Frame Loop ---
  useFrame((state, delta) => {
    if (dragRef.current.active) {
       const panSpeed = 10 * delta;
       const camDir = new THREE.Vector3();
       camera.getWorldDirection(camDir);
       camDir.y = 0;
       camDir.normalize();
       
       const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();
       
       if (dragRef.current.keys.up) dragRef.current.targetPos.add(camDir.multiplyScalar(panSpeed));
       if (dragRef.current.keys.down) dragRef.current.targetPos.sub(camDir.multiplyScalar(panSpeed));
       if (dragRef.current.keys.left) dragRef.current.targetPos.sub(camRight.multiplyScalar(panSpeed));
       if (dragRef.current.keys.right) dragRef.current.targetPos.add(camRight.multiplyScalar(panSpeed));

       setDragState(prev => ({
         ...prev,
         targetPosition: dragRef.current.targetPos.clone()
       }));
    }

    if (kickChargeStart && ghostBallRef.current) {
       const duration = (Date.now() - kickChargeStart) / 1000;
       const size = Math.min(0.2 + duration * 0.5, 2.0);
       const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
       const spawnPos = state.camera.position.clone().add(camDir.multiplyScalar(2));
       ghostBallRef.current.position.copy(spawnPos);
       ghostBallRef.current.scale.set(size, size, size);
       ghostBallRef.current.rotation.x += delta * 2;
       ghostBallRef.current.rotation.y += delta * 2;
    }

    if (placementData && ghostGroupRef.current) {
       targetRotation.current.set(...placementData.rotation);
       visualRotation.current.slerp(targetRotation.current, Math.min(1.0, delta * 15));
       ghostGroupRef.current.quaternion.copy(visualRotation.current);

       let targetPos = new THREE.Vector3(...placementData.pos);
       if (hoveredRotationAxis !== null) {
         const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
         targetPos.copy(camera.position).add(camDir.multiplyScalar(12));
       }
       visualPosition.current.lerp(targetPos, Math.min(1.0, delta * 15));
       ghostGroupRef.current.position.copy(visualPosition.current);
       if (axisGroupRef.current) axisGroupRef.current.position.copy(visualPosition.current);
    }

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
        let foundFaceInfo = null;

        if (validHit) {
          let curr: THREE.Object3D | null = validHit.object;
          while (curr && !curr.userData.partId) curr = curr.parent;
          
          if (curr) {
            foundId = curr.userData.partId;
            // Face Painting Hover Logic
            if (mode === AppMode.PAINT && (paintMode === PaintMode.FACE || paintMode === PaintMode.FILL) && validHit.face) {
                 const partData = parts.find(p => p.id === foundId);
                 if (partData) {
                    const localNormal = validHit.face.normal.clone().normalize().round();
                    let offsetPos = new THREE.Vector3();
                    
                    if (partData.type === PartType.BLOCK_LONG) {
                         const localPoint = validHit.point.clone();
                         curr.worldToLocal(localPoint);
                         const sz = Math.round(localPoint.z);
                         
                         if (Math.abs(localNormal.z) > 0.5) {
                            offsetPos.set(0, 0, localNormal.z > 0 ? 1.5 : -1.5);
                         } else {
                            offsetPos.set(localNormal.x * 0.5, localNormal.y * 0.5, sz);
                         }
                    } else {
                         offsetPos.set(localNormal.x * 0.5, localNormal.y * 0.5, localNormal.z * 0.5);
                    }
                    
                    foundFaceInfo = {
                        partId: foundId,
                        face: {
                            normal: [localNormal.x, localNormal.y, localNormal.z] as [number, number, number],
                            offset: [offsetPos.x, offsetPos.y, offsetPos.z] as [number, number, number]
                        }
                    };
                 }
            }
          }
        }
        
        setHoveredPartId(foundId);

        // Check for face info change to avoid render loop thrashing
        const faceChanged = 
            (foundFaceInfo === null && prevHoveredPaintFace.current !== null) ||
            (foundFaceInfo !== null && prevHoveredPaintFace.current === null) ||
            (foundFaceInfo && prevHoveredPaintFace.current && (
                foundFaceInfo.partId !== prevHoveredPaintFace.current.partId ||
                foundFaceInfo.face.normal[0] !== prevHoveredPaintFace.current.face.normal[0] ||
                foundFaceInfo.face.normal[1] !== prevHoveredPaintFace.current.face.normal[1] ||
                foundFaceInfo.face.normal[2] !== prevHoveredPaintFace.current.face.normal[2] ||
                foundFaceInfo.face.offset[0] !== prevHoveredPaintFace.current.face.offset[0] ||
                foundFaceInfo.face.offset[2] !== prevHoveredPaintFace.current.face.offset[2]
            ));

        if (faceChanged) {
             setHoveredPaintFace(foundFaceInfo);
             prevHoveredPaintFace.current = foundFaceInfo;
        }
      }
    }
  });

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

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
    const worldNormal = hitFace.normal.clone().applyMatrix3(normalMatrix).normalize();
    
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
    const targetPos = new THREE.Vector3(...hoverTarget.pos);
    const faceNormal = new THREE.Vector3(...hoverTarget.normal).round();
    const targetSurface = targetPos.clone().add(faceNormal.clone().multiplyScalar(0.5));
    const occupiedByExisting = new Set(parts.flatMap(p => getOccupiedCells(p).map(c => `${c[0]},${c[1]},${c[2]}`)));
    const checkFit = (rot: [number, number, number, number], offsetDist: number = 0, allowFloorCorrection: boolean = true) => {
      const q = new THREE.Quaternion(...rot);
      let pos: THREE.Vector3;
      if (selectedFace) {
         const offsetLocal = new THREE.Vector3(...selectedFace.offset);
         const offsetWorld = offsetLocal.clone().applyQuaternion(q);
         pos = targetSurface.clone().sub(offsetWorld);
      } else {
         pos = targetPos.clone().add(faceNormal);
      }
      if (offsetDist > 0) pos.add(faceNormal.clone().multiplyScalar(offsetDist));
      pos.x = Math.round(pos.x * 2) / 2;
      pos.y = Math.round(pos.y * 2) / 2;
      pos.z = Math.round(pos.z * 2) / 2;
      let testCells = getOccupiedCells({ type: selectedPartType, position: [pos.x, pos.y, pos.z], rotation: rot });
      let minY = Infinity;
      for (const cell of testCells) { if (cell[1] < minY) minY = cell[1]; }
      if (minY < 0) {
        if (!allowFloorCorrection) return { isValid: false, pos: [pos.x, pos.y, pos.z] as [number, number, number], rotation: rot };
        const liftAmount = 0 - minY;
        pos.y += liftAmount;
        testCells = getOccupiedCells({ type: selectedPartType, position: [pos.x, pos.y, pos.z], rotation: rot });
      }
      const isOverlapping = testCells.some(c => occupiedByExisting.has(`${c[0]},${c[1]},${c[2]}`));
      return { isValid: !isOverlapping, pos: [pos.x, pos.y, pos.z] as [number, number, number], rotation: rot };
    };
    const baseFit = checkFit(rawPlacementRotation, 0, false);
    if (baseFit.isValid) return baseFit;
    if (selectedFace) {
        const baseQ = new THREE.Quaternion(...rawPlacementRotation);
        const axis = faceNormal.clone(); 
        for (const angle of [Math.PI/2, Math.PI, -Math.PI/2]) {
            const rotQ = new THREE.Quaternion().setFromAxisAngle(axis, angle);
            const trialQ = rotQ.multiply(baseQ);
            const trialRot = [trialQ.x, trialQ.y, trialQ.z, trialQ.w] as [number, number, number, number];
            const trialFit = checkFit(trialRot, 0, false);
            if (trialFit.isValid) return trialFit;
        }
    }
    for (let i = 0; i < 20; i++) {
        const pushFit = checkFit(rawPlacementRotation, i, true);
        if (pushFit.isValid) return pushFit;
    }
    return { ...baseFit, isValid: false };
  }, [hoverTarget, parts, selectedPartType, rawPlacementRotation, selectedFace]);

  const handlePointerDown = (e: any) => {
    if (e.button !== 0) return; 

    if (mode === AppMode.PLAY && playTool === PlayTool.KICK) {
        setKickChargeStart(Date.now());
        pointerDownPos.current = { x: e.clientX, y: e.clientY };
        return;
    }

    if (mode === AppMode.PLAY && playTool === PlayTool.PUSH) {
       e.stopPropagation();
       const hit = e.intersections[0];
       if (hit) {
          let partRoot: THREE.Object3D | null = hit.object;
          while (partRoot && !partRoot.userData.partId) partRoot = partRoot.parent;
          
          if (partRoot && partRoot.userData.partId) {
             const dir = hit.point.clone().sub(camera.position).normalize();
             setPushState({
                isPushing: true,
                partId: partRoot.userData.partId,
                hitPoint: hit.point.clone(),
                forceDir: dir
             });
             setIsDragging(true); // Disable orbit controls while pushing
             if (controls) (controls as any).enabled = false;
          }
       }
       return;
    }

    if (mode === AppMode.PLAY && playTool === PlayTool.DRAG) {
      e.stopPropagation();
      const hit = e.intersections[0];
      if (hit) {
         let partRoot: THREE.Object3D | null = hit.object;
         while (partRoot && !partRoot.userData.partId) partRoot = partRoot.parent;
         if (partRoot) {
            dragRef.current.active = true;
            dragRef.current.targetPos.copy(hit.point);
            dragRef.current.mouseStart.set(e.clientX, e.clientY);
            setIsDragging(true);
            if (controls) (controls as any).enabled = false;
            setDragState({
               isDragging: true,
               partId: partRoot.userData.partId,
               hitPoint: hit.point.clone(),
               targetPosition: hit.point.clone()
            });
         }
      }
      return;
    }

    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: any) => {
    if (e.button !== 0 || !pointerDownPos.current) return;
    
    // Kick Tool
    if (mode === AppMode.PLAY && playTool === PlayTool.KICK && kickChargeStart) {
        const duration = (Date.now() - kickChargeStart) / 1000;
        setKickChargeStart(null);
        raycaster.setFromCamera(mouse, camera);
        const dir = raycaster.ray.direction.clone().normalize();
        const spawnPos = camera.position.clone().add(dir.multiplyScalar(2));
        const radius = Math.min(0.2 + duration * 0.5, 2.0);
        const velocity = dir.multiplyScalar(50);
        const newProj: ProjectileData = {
            id: uuidv4(),
            position: [spawnPos.x, spawnPos.y, spawnPos.z],
            velocity: [velocity.x, velocity.y, velocity.z],
            radius: radius
        };
        setProjectiles([newProj]);
        setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== newProj.id)), 3000);
        return;
    }

    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pointerDownPos.current = null;
    if (dist > 5) return;

    // Handle Paint Action with Raycast Check for Face/Normal
    if (mode === AppMode.PAINT) {
        // Re-run raycast to get precise normal at click time
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const validHit = findValidHit(intersects);
        
        if (validHit) {
            // Is it a part or floor?
            let partRoot: THREE.Object3D | null = validHit.object;
            while (partRoot && !partRoot.userData.partId) partRoot = partRoot.parent;
            
            if (partRoot && partRoot.userData.partId) {
                // Pass the normal for face detection
                if (validHit.face) {
                   // Calculate world normal of the face
                   const normalMatrix = new THREE.Matrix3().getNormalMatrix(validHit.object.matrixWorld);
                   const worldNormal = validHit.face.normal.clone().applyMatrix3(normalMatrix).normalize();
                   onPaintPart(partRoot.userData.partId, worldNormal);
                } else {
                   onPaintPart(partRoot.userData.partId);
                }
            } else if (validHit.object.name === 'visual-floor' || validHit.object.userData.isFloorTile) {
               // Floor painting
               onPaintPart("floor", undefined, true, validHit.point);
            }
        } else {
             // Fallback for floor if we missed parts but hit the logical floor plane
             const groundPoint = new THREE.Vector3();
             if (raycaster.ray.intersectPlane(floorPlane, groundPoint)) {
                onPaintPart("floor", undefined, true, groundPoint);
             }
        }
    } 
    else if (mode === AppMode.CONSTRUCTION && placementData?.isValid && hoverTarget) {
      onAddPart(placementData.pos, hoverTarget.normal, placementData.rotation);
    } else if (mode === AppMode.DELETE && hoveredPartId) {
      onRemovePart(hoveredPartId);
    } else if (mode === AppMode.SETTINGS && hoveredPartId) {
      onEditPart(hoveredPartId);
    }
  };

  const displayAxis = hoveredRotationAxis !== null ? hoveredRotationAxis : temporaryRotationAxis;
  const axisPoints = useMemo(() => {
    if (displayAxis === null) return null;
    let axisVec = new THREE.Vector3();
    if (displayAxis === 2) {
      axisVec.set(0, 1, 0);
    } else {
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
      if (displayAxis === 0) axisVec.copy(mostHorizontal);
      else axisVec.copy(otherAxis);
    }
    const p1 = axisVec.clone().multiplyScalar(-5);
    const p2 = axisVec.clone().multiplyScalar(5);
    return [p1, p2] as [THREE.Vector3, THREE.Vector3];
  }, [displayAxis, camera, camera.rotation, camera.position]); 
  
  const isFacePaint = mode === AppMode.PAINT && (paintMode === PaintMode.FACE || paintMode === PaintMode.FILL);

  return (
    <group onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      {/* Existing parts */}
      {mode !== AppMode.PLAY && parts.map(p => {
        const isHovered = hoveredPartId === p.id;
        
        return (
          <group key={p.id} position={p.position} quaternion={new THREE.Quaternion(...p.rotation)} userData={{ partId: p.id }}>
            <PartMesh 
              type={p.type} 
              mode={mode}
              isHighlighted={isHovered && !isFacePaint}
              highlightedFace={isHovered && isFacePaint && hoveredPaintFace?.partId === p.id ? hoveredPaintFace.face : null}
              isSelected={false}
              customColor={p.customColor}
              customFinish={p.customFinish}
              faceColors={p.faceColors}
              settings={p.settings}
            />
          </group>
        );
      })}

      {/* Construction Ghost */}
      {mode === AppMode.CONSTRUCTION && placementData && (
        <>
          <group ref={ghostGroupRef} userData={{ isGhost: true }}>
            <PartMesh 
              type={selectedPartType} 
              isGhost={true} 
              customColor={placementData.isValid ? (currentPaint.color || '#3b82f6') : '#ef4444'} 
              customFinish={currentPaint.finish as any}
              selectedFace={selectedFace}
            />
          </group>
          {displayAxis !== null && axisPoints && (
            <group ref={axisGroupRef}>
              <Line points={axisPoints} color="yellow" lineWidth={2} dashed dashScale={10} dashSize={0.5} gapSize={0.5} />
            </group>
          )}
        </>
      )}

      {/* Kick Tool Ghost Ball */}
      {kickChargeStart && (
        <mesh ref={ghostBallRef} renderOrder={999}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} emissive="#fbbf24" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      )}

      {/* Active Projectiles */}
      {projectiles.map(p => (
        <RigidBody key={p.id} position={p.position} linearVelocity={p.velocity} colliders="ball" restitution={0.8} mass={Math.pow(p.radius, 3) * 5} ccd>
          <Sphere args={[p.radius]}>
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} toneMapped={false} />
          </Sphere>
        </RigidBody>
      ))}

      {/* Physics Simulation */}
      {mode === AppMode.PLAY && <PlayMachine parts={parts} dragState={dragState} pushState={pushState} />}
      
      {/* Drag Visual Connector */}
      {dragState.isDragging && dragState.targetPosition && dragState.hitPoint && (
         <Line points={[dragState.targetPosition, dragState.hitPoint]} color="white" lineWidth={2} dashed dashScale={5} />
      )}
      {dragState.isDragging && dragState.targetPosition && (
         <mesh position={dragState.targetPosition}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="white" /></mesh>
      )}

      {/* Push Visual */}
      {pushState.isPushing && pushState.hitPoint && pushState.forceDir && (
         <>
             {/* Render order 1000 + depthTest false ensures this is drawn on top of everything */}
             <Line 
               points={[
                  pushState.hitPoint.clone().sub(pushState.forceDir.clone().multiplyScalar(4)), // Start point (camera side)
                  pushState.hitPoint // End point (object contact)
               ]} 
               color="#facc15" 
               lineWidth={4}
               depthTest={false}
               renderOrder={1000}
             />
             <mesh position={pushState.hitPoint} renderOrder={1000}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="#facc15" depthTest={false} />
             </mesh>
         </>
      )}

      {/* Visual Floor Surface */}
      <mesh name="visual-floor" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.8} roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Painted Floor Tiles */}
      {Object.entries(floorTiles || {}).map(([key, color]) => {
         const [x, z] = key.split(',').map(Number);
         return (
            <mesh key={key} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.49, z]} receiveShadow userData={{ isFloorTile: true }}>
               <planeGeometry args={[1, 1]} />
               <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
            </mesh>
         );
      })}

      {/* Physics Floor Collider - Lower friction to 0.5 to allow sliding */}
      <RigidBody type="fixed" position={[0, -0.55, 0]}>
        <CuboidCollider args={[500, 0.05, 500]} friction={0.5} restitution={0.2} />
      </RigidBody>
    </group>
  );
};

export default Scene;
