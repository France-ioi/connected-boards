
import { Vector3, Euler } from 'three';

export enum AppMode {
  CONSTRUCTION = 'CONSTRUCTION',
  SETTINGS = 'SETTINGS',
  PLAY = 'PLAY',
  DELETE = 'DELETE',
  PAINT = 'PAINT',
  FACE_PICKER = 'FACE_PICKER',
  LIBRARY = 'LIBRARY'
}

export enum PartType {
  BLOCK = 'BLOCK',
  BLOCK_LONG = 'BLOCK_LONG',
  WEDGE = 'WEDGE',
  MOTOR = 'MOTOR',
  JOINT = 'JOINT',
  WHEEL = 'WHEEL',
  STABILIZER = 'STABILIZER',
  LIGHT = 'LIGHT',
  THRUSTER = 'THRUSTER'
}

export enum PlayTool {
  PUSH = 'PUSH',
  DRAG = 'DRAG',
  KICK = 'KICK'
}

export interface SelectedFace {
  normal: [number, number, number];
  offset: [number, number, number];
}

export interface PartData {
  id: string;
  type: PartType;
  position: [number, number, number];
  rotation: [number, number, number, number]; // Quaternion [x, y, z, w]
  customColor?: string;
  customFinish?: 'matte' | 'glossy' | 'metallic' | 'neon';
  settings?: {
    forwardKey?: string;
    backwardKey?: string;
    speed?: number;
    power?: number;
    controlMode?: 'momentary' | 'cruise';
    // Light settings
    lightColor?: string;
    lightIntensity?: number;
    lightActivationKey?: string;
    lightControlMode?: 'momentary' | 'toggle';
    // Thruster settings
    force?: number;
    activationKey?: string;
    // Wheel steering settings
    leftKey?: string;
    rightKey?: string;
    steeringRange?: number;
    steeringSpeed?: number;
  };
}

export interface MachineState {
  parts: PartData[];
  history: PartData[][];
}

export const GRID_SIZE = 1;
