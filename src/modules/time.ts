import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function timeModuleDefinition(context: QuickalgoLibrary) {
  const sleep = function (time, callback) {
    context.increaseTimeBy(time);
    if (!context.display || context.autoGrading) {
      context.runner.noDelay(callback);
    }
    else {
      context.runner.waitDelay(callback, null, time);
    }
  };

  return {
    sleep: {
      category: 'actuator',
      blocks: [
        {
          name: "sleep", // milli-seconds (10^-3)
          params: ["Number"], // seconds
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='sleep'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1000</field></shadow></value>" +
            "</block>",
          handler: sleep,
        },
      ],
    },
    sleep_sec: {
      category: 'actuator',
      blocks: [
        {
          name: "sleep_sec", // seconds
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='sleep_sec'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>1</field></shadow></value>" +
            "</block>",
          handler: (time, callback) => {
            sleep(time * 1000, callback);
          },
        },
      ],
    },
    sleep_us: {
      category: 'actuator',
      blocks: [
        {
          name: "sleep_us",  // micro-seconds (10^-6)
          params: ["Number"],
          blocklyJson: {
            "args0": [
              { "type": "input_value", "name": "PARAM_0", "value": 0 },
            ]
          },
          blocklyXml: "<block type='sleep_us'>" +
            "<value name='PARAM_0'><shadow type='math_number'><field name='NUM'>10</field></shadow></value>" +
            "</block>",
          handler: (time, callback) => {
            sleep(time / 1000, callback);
          },
        },
      ],
    },
  } satisfies ModuleDefinition;
}
