import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function thingzCompassModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: { // category name
        Compass: { // class name
          blocks: [
            {name: "get_x", yieldsValue: true, blocklyJson: {output: "Number"}},
            {name: "get_y", yieldsValue: true, blocklyJson: {output: "Number"}},
            {name: "get_z", yieldsValue: true, blocklyJson: {output: "Number"}},
          ],
        },
      },
    },
    classImplementations: {
      Compass: {
        get_x: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readMagneticForce('x', callback);
        },
        get_y: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readMagneticForce('y', callback);
        },
        get_z: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readMagneticForce('z', callback);
        },
      }
    },
    classInstances: {
      compass: 'Compass',
    },
  }
}
