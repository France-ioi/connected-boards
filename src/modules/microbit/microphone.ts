import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function microphoneModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    classDefinitions: {
      sensors: { // category name
        Microphone: {
          blocks: [
            {name: "sound_level", yieldsValue: 'int'},
          ],
        },
      },
    },
    classImplementations: {
      Microphone: {
        sound_level: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByType('sound');
          quickPiModuleDefinition.blockImplementations.readSoundLevel(sensor.name, callback);
        },
      },
    },
    classInstances: {
      microphone: 'Microphone',
    },
  }
}
