import {ModuleDefinition} from "../module_definition";
import {quickpiModuleDefinition} from "../quickpi/quickpi";

export function timeSleepModuleDefinition(context: any, strings): ModuleDefinition {
  const quickPiModuleDefinition = quickpiModuleDefinition(context, strings);

  return {
    blockDefinitions: {
      actuator: [
        {
          name: "time.sleep", // seconds
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='time.sleep'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1</field></shadow></value>" +
            "</block>",
        },
        {
          name: "time.sleep_ms", // milli-seconds (10^-3)
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='time.sleep_ms'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1000</field></shadow></value>" +
            "</block>",
        },
        {
          name: "time.sleep_us", // micro-seconds (10^-6)
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='time.sleep_us'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>10</field></shadow></value>" +
            "</block>",
        },
      ]
    },
    blockImplementations: {
      'time.sleep': function (time, callback) {
        quickPiModuleDefinition.blockImplementations.sleep(time * 1000, callback);
      },
      'time.sleep_ms': function (time, callback) {
        quickPiModuleDefinition.blockImplementations.sleep(time, callback);
      },
      'time.sleep_us': function (time, callback) {
        quickPiModuleDefinition.blockImplementations.sleep(time / 1000, callback);
      },
    },
  }
}
