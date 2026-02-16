import React, { useState } from 'react';
import { PartData, PartType } from '../types';
import { X, Save, Keyboard, MousePointer2, Timer, Sun, Palette, Zap, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
  part: PartData;
  onSave: (settings: any) => void;
  onCancel: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ part, onSave, onCancel }) => {
  // Motor settings
  const [forwardKey, setForwardKey] = useState(part.settings?.forwardKey || 'w');
  const [backwardKey, setBackwardKey] = useState(part.settings?.backwardKey || 's');
  const [speed, setSpeed] = useState(part.settings?.speed || 15);
  const [controlMode, setControlMode] = useState<'momentary' | 'cruise'>(part.settings?.controlMode || 'momentary');

  // Light settings
  const [lightColor, setLightColor] = useState(part.settings?.lightColor || '#ffffff');
  const [lightIntensity, setLightIntensity] = useState(part.settings?.lightIntensity || 10);
  const [lightActivationKey, setLightActivationKey] = useState(part.settings?.lightActivationKey || 'l');
  const [lightControlMode, setLightControlMode] = useState<'momentary' | 'toggle'>(part.settings?.lightControlMode || 'toggle');

  // Thruster settings
  const [activationKey, setActivationKey] = useState(part.settings?.activationKey || 'shift');
  const [force, setForce] = useState(part.settings?.force || 40);

  // Wheel steering settings
  const [leftKey, setLeftKey] = useState(part.settings?.leftKey || '');
  const [rightKey, setRightKey] = useState(part.settings?.rightKey || '');
  const [steeringRange, setSteeringRange] = useState(part.settings?.steeringRange || 30);
  const [steeringSpeed, setSteeringSpeed] = useState(part.settings?.steeringSpeed || 5);

  const handleKeyCapture = (setter: (k: string) => void) => (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Escape') setter('');
    else setter(e.key.toLowerCase());
  };

  const isMotor = part.type === PartType.MOTOR;
  const isLight = part.type === PartType.LIGHT;
  const isThruster = part.type === PartType.THRUSTER;
  const isWheel = part.type === PartType.WHEEL;

  const save = () => {
    if (isMotor) onSave({ forwardKey, backwardKey, speed, controlMode });
    else if (isLight) onSave({ lightColor, lightIntensity, lightActivationKey, lightControlMode });
    else if (isThruster) onSave({ activationKey, force });
    else if (isWheel) onSave({ leftKey, rightKey, steeringRange, steeringSpeed });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Part Configuration</h2>
            <p className="text-xs text-slate-500 mt-1">Configure component behavior and aesthetics</p>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isMotor && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Control Mode</label>
                <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5">
                  <button
                    onClick={() => setControlMode('momentary')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${controlMode === 'momentary' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <MousePointer2 size={14} />
                    MOMENTARY
                  </button>
                  <button
                    onClick={() => setControlMode('cruise')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${controlMode === 'cruise' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Timer size={14} />
                    CRUISE
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rotate CW Key</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={forwardKey}
                      onKeyDown={handleKeyCapture(setForwardKey)}
                      readOnly
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-blue-400 focus:border-blue-500 outline-none transition-all"
                    />
                    <Keyboard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rotate CCW Key</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={backwardKey}
                      onKeyDown={handleKeyCapture(setBackwardKey)}
                      readOnly
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-red-400 focus:border-red-500 outline-none transition-all"
                    />
                    <Keyboard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-red-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Motor Speed</label>
                  <span className="text-xs font-mono text-blue-400">{speed} rad/s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-950 rounded-lg h-2"
                />
              </div>
            </div>
          )}

          {isWheel && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Steering Configuration</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Steer Left</label>
                  <input
                    type="text"
                    placeholder="None"
                    value={leftKey}
                    onKeyDown={handleKeyCapture(setLeftKey)}
                    readOnly
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Steer Right</label>
                  <input
                    type="text"
                    placeholder="None"
                    value={rightKey}
                    onKeyDown={handleKeyCapture(setRightKey)}
                    readOnly
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-red-400"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Steer Range</label>
                  <span className="text-xs font-mono text-blue-400">{steeringRange}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={steeringRange}
                  onChange={(e) => setSteeringRange(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-950 rounded-lg h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return Speed</label>
                  <span className="text-xs font-mono text-blue-400">{steeringSpeed}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={steeringSpeed}
                  onChange={(e) => setSteeringSpeed(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-950 rounded-lg h-2"
                />
              </div>
            </div>
          )}

          {isLight && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activation Mode</label>
                  <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5">
                    <button
                      onClick={() => setLightControlMode('toggle')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${lightControlMode === 'toggle' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <RotateCcw size={14} />
                      TOGGLE
                    </button>
                    <button
                      onClick={() => setLightControlMode('momentary')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${lightControlMode === 'momentary' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <MousePointer2 size={14} />
                      MOMENTARY
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activation Key</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={lightActivationKey}
                      onKeyDown={handleKeyCapture(setLightActivationKey)}
                      readOnly
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-blue-400 focus:border-blue-500 outline-none transition-all"
                    />
                    <Keyboard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={14} />
                  Light Beam Color
                </label>
                <div className="flex items-center gap-4 bg-slate-950 border border-white/10 p-3 rounded-2xl">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner border border-white/20 relative overflow-hidden"
                    style={{ backgroundColor: lightColor }}
                  >
                    <input 
                      type="color" 
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                    />
                  </div>
                  <span className="text-sm font-mono font-bold text-white uppercase">{lightColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sun size={14} />
                    Intensity
                  </label>
                  <span className="text-xs font-mono text-blue-400">{lightIntensity}lx</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseInt(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-950 rounded-lg h-2"
                />
              </div>
            </div>
          )}

          {isThruster && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activation Key</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={activationKey}
                    onKeyDown={handleKeyCapture(setActivationKey)}
                    readOnly
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center font-mono text-orange-400 focus:border-orange-500 outline-none transition-all"
                  />
                  <Keyboard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} />
                    Thruster Force
                  </label>
                  <span className="text-xs font-mono text-orange-400">{force}N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={force}
                  onChange={(e) => setForce(parseInt(e.target.value))}
                  className="w-full accent-orange-600 bg-slate-950 rounded-lg h-2"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={save}
            className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;