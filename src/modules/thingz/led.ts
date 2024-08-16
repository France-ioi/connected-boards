import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi";

export function thingzLedModuleDefinition(context: any, strings: any): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: {
        Led: [
          {name: 'read_light_level', yieldsValue: 'int'},
        ],
      },
      actuator: {
        Led: [
          {name: "set_colors", params: ["Number", "Number", "Number"]},
        ],
      }
    },
    classImplementations: {
      Led: {
        set_colors: function (self, red, green, blue, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledrgb');

          let command = "setLedColors(\"" + sensor.name + "\"," + red + "," + green + "," + blue + ")";

          context.registerQuickPiEvent(sensor.name, [red, green, blue]);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        read_light_level: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('light');
          quickPiModuleDefinition.blockImplementations.readLightIntensity(sensor.name, callback);
        },
      },
    },
    classInstances: {
      led: 'Led',
    },
  }
}
