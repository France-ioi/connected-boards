import {ModuleDefinition} from "../module_definition";

export default function (context: any): ModuleDefinition {
  return {
    blockDefinitions: {
      sensors: { // category name
        Accel: [ // class name
          {name: "get_x", yieldsValue: true, blocklyJson: {output: "Number"}},
          {name: "get_y", yieldsValue: true, blocklyJson: {output: "Number"}},
          {name: "get_z", yieldsValue: true, blocklyJson: {output: "Number"}},
        ],
      }
    },
    classImplementations: {
      Accel: {
        get_x: function (self, callback) {
          context.quickpi.readAcceleration('x', callback);
        },
        get_y: function (self, callback) {
          context.quickpi.readAcceleration('y', callback);
        },
        get_z: function (self, callback) {
          context.quickpi.readAcceleration('z', callback);
        },
      }
    }
  }
}
