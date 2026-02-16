
import React from 'react';
import { PartType } from './types';
import { Box, Triangle, Cpu, Settings2, Circle, Anchor, StretchHorizontal, Square, Zap, Sparkles, Layers, Lightbulb, Rocket } from 'lucide-react';

export const PART_DEFINITIONS = [
  {
    type: PartType.BLOCK,
    name: 'Standard Block',
    icon: <Box size={20} />,
    description: 'A solid 1x1x1 construction block.',
    color: '#3b82f6',
  },
  {
    type: PartType.BLOCK_LONG,
    name: 'Long Block',
    icon: <StretchHorizontal size={20} />,
    description: 'A solid 3x1x1 construction block.',
    color: '#2563eb',
  },
  {
    type: PartType.WEDGE,
    name: 'Wedge',
    icon: <Triangle size={20} className="rotate-90" />,
    description: 'Sloped block for aerodynamics or aesthetics.',
    color: '#3b82f6',
  },
  {
    type: PartType.MOTOR,
    name: 'Motor',
    icon: <Cpu size={20} />,
    description: 'Rotating component. Can be bound to keys.',
    color: '#ef4444',
  },
  {
    type: PartType.THRUSTER,
    name: 'Thruster',
    icon: <Rocket size={20} />,
    description: 'Provides powerful directional propulsion.',
    color: '#f97316',
  },
  {
    type: PartType.LIGHT,
    name: 'Directional Light',
    icon: <Lightbulb size={20} />,
    description: 'Projects light in one direction. Fully configurable.',
    color: '#eab308',
  },
  {
    type: PartType.JOINT,
    name: 'Passive Joint',
    icon: <Settings2 size={20} />,
    description: 'Free-rotating pivot for steering or suspension.',
    color: '#f59e0b',
  },
  {
    type: PartType.WHEEL,
    name: 'Wheel',
    icon: <Circle size={20} />,
    description: 'High friction cylinder for ground movement.',
    color: '#111827',
  },
  {
    type: PartType.STABILIZER,
    name: 'Heavy Block',
    icon: <Anchor size={20} />,
    description: 'High density block for lowering center of mass.',
    color: '#6366f1',
  }
];

export const CATEGORIES = [
  { name: 'Basics', types: [PartType.BLOCK, PartType.BLOCK_LONG, PartType.WEDGE, PartType.STABILIZER, PartType.LIGHT] },
  // { name: 'Mechanical', types: [PartType.MOTOR, PartType.JOINT, PartType.WHEEL, PartType.THRUSTER] },
];

export const PAINT_CATEGORIES = [
  {
    name: 'Primary Colors',
    items: [
      { id: 'red', value: '#ef4444', name: 'Race Red' },
      { id: 'blue', value: '#3b82f6', name: 'Sonic Blue' },
      { id: 'green', value: '#10b981', name: 'Emerald' },
      { id: 'yellow', value: '#f59e0b', name: 'Warning Gold' },
      { id: 'orange', value: '#f97316', name: 'Industrial Orange' },
      { id: 'purple', value: '#8b5cf6', name: 'Hyper Purple' },
    ]
  },
  {
    name: 'Grayscale',
    items: [
      { id: 'white', value: '#f8fafc', name: 'Arctic White' },
      { id: 'gray', value: '#64748b', name: 'Steel' },
      { id: 'dark', value: '#1e293b', name: 'Deep Space' },
      { id: 'black', value: '#020617', name: 'Obsidian' },
    ]
  },
  {
    name: 'Finishes',
    items: [
      { id: 'matte', value: 'matte', name: 'Matte', icon: <Square size={16} /> },
      { id: 'glossy', value: 'glossy', name: 'Glossy', icon: <Layers size={16} /> },
      { id: 'metallic', value: 'metallic', name: 'Metallic', icon: <Sparkles size={16} /> },
      { id: 'neon', value: 'neon', name: 'Neon Glow', icon: <Zap size={16} /> },
    ]
  }
];
