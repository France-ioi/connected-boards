
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { RigidBody, CuboidCollider, CylinderCollider, useRevoluteJoint, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { PartData, PartType, AppMode } from '../types';
import PartMesh from './PartMesh';
import * as THREE from 'three';

interface PlayMachineProps {
  parts: PartData[];
}

const getPartCells = (part: PartData): THREE.Vector3[] => {
  const cells: THREE.Vector3[] = [new THREE.Vector3(...part.position)];
  if (part.type === PartType.BLOCK_LONG) {
    const quat = new THREE.Quaternion(...part.rotation);
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    const pos = new THREE.Vector3(...part.position);
    cells.push(pos.clone().add(dir).round());
    cells.push(pos.clone().sub(dir).round());
  }
  return cells;
};

interface JointConfig {
  motorPart: PartData;
  rotorPart: PartData;
  motorIslandIdx: number;
  rotorIslandIdx: number;
}

interface SteeringConfig {
  wheelPart: PartData;
  islandIdx: number;
  steeringIslandIdx: number;
}

const IslandMotor: React.FC<{
  body1: React.RefObject<RapierRigidBody | null>;
  body2: React.RefObject<RapierRigidBody | null>;
  config: JointConfig;
  motorIslandOrigin: THREE.Vector3;
  rotorIslandOrigin: THREE.Vector3;
}> = ({ body1, body2, config, motorIslandOrigin, rotorIslandOrigin }) => {
  const { motorPart } = config;

  const jointParams = useMemo(() => {
    const quat = new THREE.Quaternion(...motorPart.rotation);
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    
    const motorPos = new THREE.Vector3(...motorPart.position);
    const jointPosWorld = motorPos.clone().add(forward.clone().multiplyScalar(0.5));
    
    const anchor1: [number, number, number] = [
      jointPosWorld.x - motorIslandOrigin.x,
      jointPosWorld.y - motorIslandOrigin.y,
      jointPosWorld.z - motorIslandOrigin.z
    ];
    
    const anchor2: [number, number, number] = [
      jointPosWorld.x - rotorIslandOrigin.x,
      jointPosWorld.y - rotorIslandOrigin.y,
      jointPosWorld.z - rotorIslandOrigin.z
    ];

    const axis: [number, number, number] = [forward.x, forward.y, forward.z];
    
    return { anchor1, anchor2, axis };
  }, [motorPart, motorIslandOrigin, rotorIslandOrigin]);

  const jointRef = useRevoluteJoint(body1, body2, [
    jointParams.anchor1,
    jointParams.anchor2,
    jointParams.axis
  ]);

  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const cruiseSpeed = useRef(0);
  const zeroStopTimer = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const up = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!jointRef.current) return;

    const settings = motorPart.settings || { forwardKey: 'w', backwardKey: 's', speed: 15, power: 100, controlMode: 'momentary' };
    const { forwardKey = 'w', backwardKey = 's', speed = 15, power = 100, controlMode = 'momentary' } = settings;

    let targetVelocity = 0;

    if (controlMode === 'cruise') {
      const accel = speed * delta * 2.0;
      let currentSpeed = cruiseSpeed.current;
      
      let inputDir = 0;
      if (keys[forwardKey]) inputDir += 1;
      if (keys[backwardKey]) inputDir -= 1;
      
      const proposedSpeed = currentSpeed + (inputDir * accel);
      const isCrossingZero = (currentSpeed > 0 && proposedSpeed < 0) || (currentSpeed < 0 && proposedSpeed > 0);
      
      if (isCrossingZero) {
        currentSpeed = 0;
        zeroStopTimer.current = 0.35;
      } else if (currentSpeed === 0 && inputDir !== 0) {
        if (zeroStopTimer.current > 0) {
          zeroStopTimer.current -= delta;
          currentSpeed = 0;
        } else {
          currentSpeed = proposedSpeed;
        }
      } else {
        currentSpeed = proposedSpeed;
        if (currentSpeed === 0 && inputDir === 0) {
          zeroStopTimer.current = 0;
        }
      }

      currentSpeed = Math.max(-speed, Math.min(speed, currentSpeed));
      cruiseSpeed.current = currentSpeed;
      targetVelocity = cruiseSpeed.current;
    } else {
      if (keys[forwardKey]) targetVelocity = speed;
      else if (keys[backwardKey]) targetVelocity = -speed;
    }

    jointRef.current.configureMotorVelocity(targetVelocity, power * 50);
  });

  return null;
};

const WheelSteeringJoint: React.FC<{
  body1: React.RefObject<RapierRigidBody | null>;
  body2: React.RefObject<RapierRigidBody | null>;
  config: SteeringConfig;
  island1Origin: THREE.Vector3;
  island2Origin: THREE.Vector3;
}> = ({ body1, body2, config, island1Origin, island2Origin }) => {
  const { wheelPart } = config;
  const jointParams = useMemo(() => {
    const quat = new THREE.Quaternion(...wheelPart.rotation);
    // Pivot at the attachment point (behind the axle/tire)
    const pivotLocal = new THREE.Vector3(0, 0, -0.4).applyQuaternion(quat);
    const pivotWorld = new THREE.Vector3(...wheelPart.position).add(pivotLocal);
    
    const anchor1: [number, number, number] = [
      pivotWorld.x - island1Origin.x,
      pivotWorld.y - island1Origin.y,
      pivotWorld.z - island1Origin.z
    ];
    const anchor2: [number, number, number] = [
      pivotWorld.x - island2Origin.x,
      pivotWorld.y - island2Origin.y,
      pivotWorld.z - island2Origin.z
    ];
    
    const axis: [number, number, number] = [0, 1, 0];
    return { anchor1, anchor2, axis };
  }, [wheelPart, island1Origin, island2Origin]);

  const jointRef = useRevoluteJoint(body1, body2, [
    jointParams.anchor1,
    jointParams.anchor2,
    jointParams.axis
  ]);

  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const currentAngle = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const up = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!jointRef.current) return;
    const settings = wheelPart.settings || { leftKey: '', rightKey: '', steeringRange: 30, steeringSpeed: 5 };
    const { leftKey, rightKey, steeringRange = 30, steeringSpeed = 5 } = settings;
    
    const maxRad = steeringRange * (Math.PI / 180);
    let targetAngle = 0;
    if (leftKey && keys[leftKey]) targetAngle = maxRad;
    else if (rightKey && keys[rightKey]) targetAngle = -maxRad;
    
    const diff = targetAngle - currentAngle.current;
    currentAngle.current += diff * Math.min(1.0, steeringSpeed * delta);
    
    jointRef.current.configureMotorPosition(currentAngle.current, 100, 10);
  });

  return null;
};

const IslandThrusters: React.FC<{
  body: React.RefObject<RapierRigidBody | null>;
  thrusters: PartData[];
  islandOrigin: THREE.Vector3;
}> = ({ body, thrusters, islandOrigin }) => {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const up = (e: KeyboardEvent) => setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!body.current) return;
    
    thrusters.forEach(t => {
      const { activationKey = 'shift', force = 40 } = t.settings || {};
      if (keys[activationKey.toLowerCase()]) {
        const rbQuatRaw = body.current!.rotation();
        const rbQuat = new THREE.Quaternion(rbQuatRaw.x, rbQuatRaw.y, rbQuatRaw.z, rbQuatRaw.w);
        const partQuat = new THREE.Quaternion(...t.rotation);
        
        const localDir = new THREE.Vector3(0, 0, -1).applyQuaternion(partQuat);
        const worldDir = localDir.clone().applyQuaternion(rbQuat);
        
        const relPos = new THREE.Vector3(
          t.position[0] - islandOrigin.x,
          t.position[1] - islandOrigin.y,
          t.position[2] - islandOrigin.z
        ).applyQuaternion(rbQuat);

        const impulseForce = force * delta * 50;
        body.current!.applyImpulseAtPoint(
          { x: worldDir.x * impulseForce, y: worldDir.y * impulseForce, z: worldDir.z * impulseForce },
          { x: islandOrigin.x + relPos.x, y: islandOrigin.y + relPos.y, z: islandOrigin.z + relPos.z },
          true
        );
      }
    });
  });

  return null;
};

const LightController: React.FC<{
  part: PartData;
  onStateChange: (id: string, isOn: boolean) => void;
}> = ({ part, onStateChange }) => {
  const [isOn, setIsOn] = useState(true);
  const prevKeyPressed = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = part.settings?.lightActivationKey || 'l';
      const mode = part.settings?.lightControlMode || 'toggle';
      const isPressed = e.key.toLowerCase() === key.toLowerCase();

      if (isPressed) {
        if (mode === 'toggle') {
          if (!prevKeyPressed.current) {
            setIsOn(v => !v);
          }
        } else {
          setIsOn(true);
        }
        prevKeyPressed.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = part.settings?.lightActivationKey || 'l';
      const mode = part.settings?.lightControlMode || 'toggle';
      if (e.key.toLowerCase() === key.toLowerCase()) {
        if (mode === 'momentary') {
          setIsOn(false);
        }
        prevKeyPressed.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [part.settings]);

  useEffect(() => {
    onStateChange(part.id, isOn);
  }, [isOn, part.id, onStateChange]);

  return null;
};

const PlayMachine: React.FC<PlayMachineProps> = ({ parts }) => {
  const [lightStates, setLightStates] = useState<{ [id: string]: boolean }>({});

  const handleLightStateChange = (id: string, isOn: boolean) => {
    setLightStates(prev => {
      if (prev[id] === isOn) return prev;
      return { ...prev, [id]: isOn };
    });
  };

  const { islands, motorConnections, steeringConnections } = useMemo(() => {
    const motorToRotor = new Map<string, string>();

    parts.filter(p => p.type === PartType.MOTOR).forEach(motor => {
      const quat = new THREE.Quaternion(...motor.rotation);
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
      const rotorTargetPos = new THREE.Vector3(...motor.position).add(forward).round();
      
      const rotor = parts.find(p => {
        if (p.id === motor.id) return false;
        return getPartCells(p).some(c => c.distanceToSquared(rotorTargetPos) < 0.1);
      });

      if (rotor) {
        motorToRotor.set(motor.id, rotor.id);
      }
    });

    const islandsList: { parts: PartData[], origin: THREE.Vector3 }[] = [];
    const processedIds = new Set<string>();

    parts.forEach(startPart => {
      if (processedIds.has(startPart.id)) return;

      const currentIslandParts: PartData[] = [];
      const stack = [startPart];
      processedIds.add(startPart.id);

      while (stack.length > 0) {
        const part = stack.pop()!;
        currentIslandParts.push(part);

        const partCells = getPartCells(part);
        const neighbors = parts.filter(p => {
          if (processedIds.has(p.id)) return false;
          if (motorToRotor.get(part.id) === p.id) return false;
          if (motorToRotor.get(p.id) === part.id) return false;

          const neighborCells = getPartCells(p);
          return partCells.some(c1 => neighborCells.some(c2 => c1.distanceToSquared(c2) <= 1.1));
        });

        neighbors.forEach(n => {
          processedIds.add(n.id);
          stack.push(n);
        });
      }

      const avgPos = new THREE.Vector3();
      currentIslandParts.forEach(p => avgPos.add(new THREE.Vector3(...p.position)));
      avgPos.divideScalar(currentIslandParts.length);
      islandsList.push({ parts: currentIslandParts, origin: avgPos });
    });

    const finalIslands: { parts: PartData[], origin: THREE.Vector3, isTireOnly?: boolean, wheelId?: string }[] = [];
    const steeringConfigs: SteeringConfig[] = [];

    islandsList.forEach((isl, islIdx) => {
      const steerableWheels = isl.parts.filter(p => 
        p.type === PartType.WHEEL && (p.settings?.leftKey || p.settings?.rightKey)
      );
      
      if (steerableWheels.length === 0) {
        finalIslands.push(isl);
      } else {
        finalIslands.push(isl);
        const baseIslIdx = finalIslands.length - 1;

        steerableWheels.forEach(w => {
          finalIslands.push({
            parts: [w],
            origin: new THREE.Vector3(...w.position),
            isTireOnly: true,
            wheelId: w.id
          });
          steeringConfigs.push({
            wheelPart: w,
            islandIdx: baseIslIdx,
            steeringIslandIdx: finalIslands.length - 1
          });
        });
      }
    });

    const mConnections: JointConfig[] = [];
    motorToRotor.forEach((rotorId, motorId) => {
      const motorIslandIdx = finalIslands.findIndex(isl => !isl.isTireOnly && isl.parts.some(p => p.id === motorId));
      const rotorIslandIdx = finalIslands.findIndex(isl => !isl.isTireOnly && isl.parts.some(p => p.id === rotorId));
      
      if (motorIslandIdx !== -1 && rotorIslandIdx !== -1 && motorIslandIdx !== rotorIslandIdx) {
        mConnections.push({
          motorPart: parts.find(p => p.id === motorId)!,
          rotorPart: parts.find(p => p.id === rotorId)!,
          motorIslandIdx,
          rotorIslandIdx
        });
      }
    });

    return { islands: finalIslands, motorConnections: mConnections, steeringConnections: steeringConfigs };
  }, [parts]);

  const islandRefs = useMemo(() => islands.map(() => React.createRef<RapierRigidBody>()), [islands]);

  return (
    <>
      {parts.filter(p => p.type === PartType.LIGHT).map(p => (
        <LightController key={p.id} part={p} onStateChange={handleLightStateChange} />
      ))}

      {islands.map((island, idx) => {
        const thrusters = island.isTireOnly ? [] : island.parts.filter(p => p.type === PartType.THRUSTER);
        return (
          <React.Fragment key={`island-frag-${idx}`}>
            <RigidBody
              ref={islandRefs[idx]}
              key={`island-${idx}`}
              position={[island.origin.x, island.origin.y, island.origin.z]}
              colliders={false}
              friction={0.8}
              restitution={0.2}
              linearDamping={0.5}
              angularDamping={0.5}
              ccd={true}
            >
              {island.parts.map(part => {
                const relPos: [number, number, number] = [
                  part.position[0] - island.origin.x,
                  part.position[1] - island.origin.y,
                  part.position[2] - island.origin.z
                ];

                const isSteerable = part.type === PartType.WHEEL && (part.settings?.leftKey || part.settings?.rightKey);
                const wheelRadius = 0.845;

                return (
                  <group key={part.id} position={relPos} quaternion={new THREE.Quaternion(...part.rotation)}>
                    <PartMesh 
                      type={part.type} 
                      mode={AppMode.PLAY}
                      customColor={part.customColor} 
                      customFinish={part.customFinish} 
                      settings={part.settings}
                      subPart={part.type === PartType.WHEEL ? (island.isTireOnly ? 'tire' : (isSteerable ? 'plate' : undefined)) : undefined}
                      lightOn={part.type === PartType.LIGHT ? (lightStates[part.id] ?? true) : undefined}
                    />
                    
                    {part.type === PartType.WHEEL ? (
                       island.isTireOnly ? (
                          <CylinderCollider args={[0.2, wheelRadius]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]} />
                       ) : isSteerable ? (
                          <CylinderCollider args={[0.0625, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.4375]} />
                       ) : (
                          <>
                            <CylinderCollider args={[0.0625, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.4375]} />
                            <CylinderCollider args={[0.2, wheelRadius]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]} />
                          </>
                       )
                    ) : part.type === PartType.BLOCK_LONG ? (
                      <CuboidCollider args={[0.5, 0.5, 1.5]} />
                    ) : part.type === PartType.STABILIZER ? (
                      <CuboidCollider args={[0.5, 0.5, 0.5]} mass={5.0} />
                    ) : (
                      <CuboidCollider args={[0.5, 0.5, 0.5]} />
                    )}
                  </group>
                );
              })}
            </RigidBody>
            {thrusters.length > 0 && (
              <IslandThrusters 
                body={islandRefs[idx]} 
                thrusters={thrusters} 
                islandOrigin={island.origin} 
              />
            )}
          </React.Fragment>
        );
      })}

      {motorConnections.map((conn, idx) => (
        <IslandMotor
          key={`motor-${idx}`}
          body1={islandRefs[conn.motorIslandIdx]}
          body2={islandRefs[conn.rotorIslandIdx]}
          config={conn}
          motorIslandOrigin={islands[conn.motorIslandIdx].origin}
          rotorIslandOrigin={islands[conn.rotorIslandIdx].origin}
        />
      ))}

      {steeringConnections.map((conn, idx) => (
        <WheelSteeringJoint
          key={`steer-${idx}`}
          body1={islandRefs[conn.islandIdx]}
          body2={islandRefs[conn.steeringIslandIdx]}
          config={conn}
          island1Origin={islands[conn.islandIdx].origin}
          island2Origin={islands[conn.steeringIslandIdx].origin}
        />
      ))}
    </>
  );
};

export default PlayMachine;
