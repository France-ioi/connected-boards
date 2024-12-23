import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function thingzAccelerometerModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: { // category name
        Accel: { // class name
          blocks: [
            {name: "get_x", yieldsValue: true, blocklyJson: {output: "Number"}},
            {name: "get_y", yieldsValue: true, blocklyJson: {output: "Number"}},
            {name: "get_z", yieldsValue: true, blocklyJson: {output: "Number"}},
          ],
        },
      },
    },
    classImplementations: {
      Accel: {
        get_x: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readAcceleration('x', callback);
        },
        get_y: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readAcceleration('y', callback);
        },
        get_z: function (self, callback) {
          quickPiModuleDefinition.blockImplementations.readAcceleration('z', callback);
        },
      }
    },
    classInstances: {
      accelerometer: 'Accel',
    },
  }
}
