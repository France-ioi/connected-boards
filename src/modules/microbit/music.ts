import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function musicModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    blockDefinitions: {
      actuator: [
        {
          name: "music.pitch",
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='music.pitch'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>200</field></shadow></value>" +
            "</block>",
        },
        {name: "music.stop"},
      ]
    },
    blockImplementations: {
      'music.pitch': function (frequency, callback) {
        const sensor = context.sensorHandler.findSensorByType('buzzer');
        quickPiModuleDefinition.blockImplementations.setBuzzerNote(sensor.name, frequency, callback);
      },
      'music.stop': function (callback) {
        const sensor = context.sensorHandler.findSensorByType('buzzer');
        quickPiModuleDefinition.blockImplementations.setBuzzerState(sensor.name, false, callback);
      },
    },
  }
}
