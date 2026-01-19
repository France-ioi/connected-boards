import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {buzzerSound} from "../sensors/util/buzzer_sound";

export function buzzerModuleDefinition(context: QuickalgoLibrary, strings: any) {
  const sensorHandler = context.sensorHandler;

  const turnBuzzerOn = function (callback) {
    context.registerQuickPiEvent("buzzer1", true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("turnBuzzerOn()", cb);
    }
  };

  const turnBuzzerOff = function (callback) {
    context.registerQuickPiEvent("buzzer1", false);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("turnBuzzerOff()", cb);
    }
  };

  const setBuzzerState = function (name, state, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);

    let command = "setBuzzerState(\"" + name + "\"," + (state ? "True" : "False") + ")";

    context.registerQuickPiEvent(name, state ? true : false);

    if (context.display) {
      state ? buzzerSound.start(name) : buzzerSound.stop(name);
    }

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const isBuzzerOn = function (arg1, arg2) {
    let callback;
    let sensor;
    if (typeof arg2 == "undefined") {
      // no arguments
      callback = arg1;
      sensor = sensorHandler.findSensorByType("buzzer");
    } else {
      callback = arg2;
      sensor = sensorHandler.findSensorByName(arg1, true);
    }

    let command = "isBuzzerOn(\"" + sensor.name + "\")";

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState("buzzer1");
      context.waitDelay(callback, state);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function (returnVal) {
        returnVal = parseFloat(returnVal)
        cb(returnVal);
      });
    }
  };

  const setBuzzerNote = function (name, frequency, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);
    let command = "setBuzzerNote(\"" + name + "\"," + frequency + ")";

    context.registerQuickPiEvent(name, frequency);

    if (context.display && context.offLineMode) {
      buzzerSound.start(name, frequency);
    }

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function (returnVal) {
        returnVal = parseFloat(returnVal)
        cb(returnVal);

      });
    }
  };

  const getBuzzerNote = function (name, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);

    let command = "getBuzzerNote(\"" + name + "\")";

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback, sensor.state);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function (returnVal) {
        returnVal = parseFloat(returnVal)
        cb(returnVal);

      });
    }
  };

  return {
    turnBuzzerOn: {
      category: 'actuator',
      blocks: [
        {
          name: "turnBuzzerOn",
          handler: turnBuzzerOn,
        },
      ],
    },
    turnBuzzerOff: {
      category: 'actuator',
      blocks: [
        {
          name: "turnBuzzerOff",
          handler: turnBuzzerOff,
        },
      ],
    },
    setBuzzerState: {
      category: 'actuator',
      blocks: [
        {
          name: "setBuzzerState",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
              },
              { "type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]] },
            ]
          },
          handler: setBuzzerState,
        },
      ],
    },
    setBuzzerNote: {
      category: 'actuator',
      blocks: [
        {
          name: "setBuzzerNote",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
              },
              { "type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='setBuzzerNote'>" +
            "<value name='PARAM_1'><shadow type='math_number'><field name='NUM'>200</field></shadow></value>" +
            "</block>",
          handler: setBuzzerNote,
        },
      ],
    },
    getBuzzerNote: {
      category: 'actuator',
      blocks: [
        {
          name: "getBuzzerNote",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
              },
            ]
          },
          handler: getBuzzerNote,
        },
      ],
    },
    isBuzzerOn: {
      category: 'actuator',
      blocks: [
        {
          name: "isBuzzerOn",
          yieldsValue: 'bool',
          handler: isBuzzerOn,
        },
      ],
    },
    isBuzzerOnWithName: {
      category: 'actuator',
      blocks: [
        {
          name: "isBuzzerOnWithName",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("buzzer")
              },
            ]
          },
          handler: isBuzzerOn,
        },
      ],
    },

    pitch: {
      category: 'actuator',
      blocks: [
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
          handler: (frequency: number, callback) => {
            const sensor = context.sensorHandler.findSensorByType('buzzer');
            setBuzzerNote(sensor.name, frequency, callback);
          },
        },
      ],
    },

    stop: {
      category: 'actuator',
      blocks: [
        {
          name: "music.stop",
          handler: (callback) => {
            const sensor = context.sensorHandler.findSensorByType('buzzer');
            setBuzzerState(sensor.name, false, callback);
          },
        },
      ],
    },

  } satisfies ModuleDefinition;
}
