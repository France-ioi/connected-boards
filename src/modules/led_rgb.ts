import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function ledRgbModuleDefinition(context: QuickalgoLibrary) {
  const ledSetColors = function (red, green, blue, callback) {
    const sensor = context.sensorHandler.findSensorByType('ledrgb');

    const newState = [red, green, blue];
    context.registerQuickPiEvent(sensor.name, newState);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      sensor.setLiveState(newState, cb);
    }
  };

  return {
    ledSetColors: {
      category: 'actuator',
      blocks: [
        {
          name: "setLedColors",
          params: ["Number", "Number", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0"},
              {"type": "input_value", "name": "PARAM_1"},
              {"type": "input_value", "name": "PARAM_2"},
            ]
          },
          blocklyXml: "<block type='setLedColors'>" +
            "<value name='PARAM_0'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "<value name='PARAM_2'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: ledSetColors,
        },
      ],
      classMethods: {
        Led: {
          instances: ['led'],
          methods: {
            set_colors: {
              params: ["Number", "Number", "Number"],
              yieldsValue: 'int',
              handler: function (self, red: number, green: number, blue: number, callback) {
                ledSetColors(red, green, blue, callback);
              },
            },
          },
        },
      }
    },
  } satisfies ModuleDefinition;
}
