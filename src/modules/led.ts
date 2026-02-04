import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function ledModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const turnLedOn = (callback) => {
    let sensor = sensorHandler.findSensorByType("led");

    context.registerQuickPiEvent(sensor.name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand("turnLedOn()", cb);
    }
  };

  const turnLedOff = (callback) => {
    let sensor = sensorHandler.findSensorByType("led");

    context.registerQuickPiEvent(sensor.name, false);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand("turnLedOff()", cb);
    }
  };

  const setLedState = (name, state, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);
    let command = "setLedState(\"" + sensor.port + "\"," + (state ? "True" : "False") + ")";

    context.registerQuickPiEvent(name, state ? true : false);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const setLedBrightness = (name, level, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (typeof level == "object") {
      level = level.valueOf();
    }

    let command = "setLedBrightness(\"" + name + "\"," + level + ")";

    context.registerQuickPiEvent(name, level);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const getLedBrightness = (name, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    let command = "getLedBrightness(\"" + name + "\")";

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback, sensor.state);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function(returnVal) {
        returnVal = parseFloat(returnVal);
        cb(returnVal);
      });
    }
  };

  const isLedOn = (arg1, arg2) => {
    let callback;
    let sensor;
    if (typeof arg2 == "undefined") {
      // no arguments
      callback = arg1;
      sensor = sensorHandler.findSensorByType("led");
    } else {
      callback = arg2;
      sensor = sensorHandler.findSensorByName(arg1, true);
    }

    let command = "getLedState(\"" + sensor.name + "\")";

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback, sensor.state);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, function(returnVal) {
        returnVal = parseFloat(returnVal);
        cb(returnVal);
      });
    }
  };

  const toggleLedState = (name, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    let command = "toggleLedState(\"" + name + "\")";
    let state = sensor.state;

    context.registerQuickPiEvent(name, !state);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, function(returnVal) { return returnVal != "0"; });
    }
  };

  return {
    turnLedOn: {
      category: 'actuator',
      blocks: [
        {
          name: "turnLedOn",
          handler: turnLedOn,
        },
      ],
    },
    turnLedOff: {
      category: 'actuator',
      blocks: [
        {
          name: "turnLedOff",
          handler: turnLedOff,
        },
      ],
    },
    setLedState: {
      category: 'actuator',
      blocks: [
        {
          name: "setLedState",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")},
              {"type": "field_dropdown", "name": "PARAM_1", "options": [[strings.messages.on.toUpperCase(), "1"], [strings.messages.off.toUpperCase(), "0"]]},
            ]
          },
          handler: setLedState,
        },
      ],
    },
    setLedBrightness: {
      category: 'actuator',
      blocks: [
        {
          name: "setLedBrightness",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='setLedBrightness'>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: setLedBrightness,
        },
      ],
    },
    getLedBrightness: {
      category: 'actuator',
      blocks: [
        {
          name: "getLedBrightness",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")},
            ]
          },
          handler: getLedBrightness,
        },
      ],
    },
    isLedOn: {
      category: 'actuator',
      blocks: [
        {
          name: "isLedOn",
          yieldsValue: 'bool',
          handler: isLedOn,
        },
      ],
    },
    isLedOnWithName: {
      category: 'actuator',
      blocks: [
        {
          name: "isLedOnWithName",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")},
            ]
          },
          handler: isLedOn,
        },
      ],
    },
    toggleLedState: {
      category: 'actuator',
      blocks: [
        {
          name: "toggleLedState",
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("led")},
            ]
          },
          handler: toggleLedState,
        },
      ],
    },
  } satisfies ModuleDefinition;
}