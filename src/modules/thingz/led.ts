import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function thingzLedModuleDefinition(context: any, strings: any): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: {
        Led: {
          blocks: [
            {name: 'read_light_level', yieldsValue: 'int'},
          ],
        },
      },
      actuator: {
        Led: {
          blocks: [
            {name: "set_colors", params: ["Number", "Number", "Number"]},
          ],
        }
      }
    },
    classImplementations: {
      Led: {
        set_colors: function (self, red, green, blue, callback) {
          const sensor = context.sensorHandler.findSensorByType('ledrgb');

          const newState = [red, green, blue];
          context.registerQuickPiEvent(sensor.name, newState);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let cb = context.runner.waitCallback(callback);

            sensor.setLiveState(newState, cb);
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
