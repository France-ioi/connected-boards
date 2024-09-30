import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function musicModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    blockDefinitions: {
      actuator: [
        {name: "pitch", params: ['Number']},
        {name: "stop"},
      ]
    },
    blockImplementations: {
      pitch: function (frequency, callback) {
        const sensor = context.sensorHandler.findSensorByType('buzzer');
        quickPiModuleDefinition.blockImplementations.setBuzzerNote(sensor.name, frequency, callback);
      },
      stop: function (callback) {
        const sensor = context.sensorHandler.findSensorByType('buzzer');
        quickPiModuleDefinition.blockImplementations.setBuzzerState(sensor.name, false, callback);
      },
    },
  }
}
