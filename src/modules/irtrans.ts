import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function irtransModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const setInfraredState = (name, state, callback) => {
    const sensor = sensorHandler.findSensorByName(name, true);

    context.registerQuickPiEvent(name, !!state);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      sensor.setLiveState(state, cb);
    }
  };

  const sendIRMessage = (name, preset, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("sendIRMessage(\"irtran1\", \"" + preset + "\")", function(returnVal) {
        cb();
      }, true);
    }
  };

  const presetIRMessage = (preset, data, callback) => {
    if (!context.remoteIRcodes)
      context.remoteIRcodes = {};

    context.remoteIRcodes[preset] = data;

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("presetIRMessage(\"" + preset + "\", \"" + JSON.stringify(JSON.parse(data)) + "\")", function(returnVal) {
        cb();
      }, true);
    }
  };

  return {
    setInfraredState: {
      category: 'actuator',
      blocks: [
        {
          name: "setInfraredState",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irtrans")},
              {"type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]]},
            ]
          },
          handler: setInfraredState,
        },
      ],
    },
    sendIRMessage: {
      category: 'actuator',
      blocks: [
        {
          name: "sendIRMessage",
          params: ["String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("irtrans")},
              {"type": "input_value", "name": "PARAM_1", "text": ""},
            ]
          },
          blocklyXml: "<block type='sendIRMessage'>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: sendIRMessage,
        },
      ],
    },
    presetIRMessage: {
      category: 'actuator',
      blocks: [
        {
          name: "presetIRMessage",
          params: ["String", "String"],
          blocklyJson: {
            "args0": [
              {"type": "input_value", "name": "PARAM_0", "text": ""},
              {"type": "input_value", "name": "PARAM_1", "text": ""},
            ]
          },
          blocklyXml: "<block type='presetIRMessage'>" +
            "<value name='PARAM_0'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "<value name='PARAM_1'><shadow type='text'><field name='TEXT'></field> </shadow></value>" +
            "</block>",
          handler: presetIRMessage,
        },
      ],
    },
  } satisfies ModuleDefinition;
}