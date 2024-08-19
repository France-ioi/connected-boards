import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function thingzTemperatureModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    blockDefinitions: {
      sensors: [
        {
          name: 'temperature', yieldsValue: 'int',
        },
      ]
    },
    blockImplementations: {
      temperature: function (callback) {
        const sensor = context.sensorHandler.findSensorByType('temperature');
        quickPiModuleDefinition.blockImplementations.readTemperature(sensor.name, callback);
      }
    },
  }
}
