import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function servoModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const setServoAngle = (name, angle, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (angle > 180)
      angle = 180;
    else if (angle < 0)
      angle = 0;

    context.registerQuickPiEvent(name, angle);
    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let command = "setServoAngle(\"" + name + "\"," + angle + ")";
      const cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const getServoAngle = (name, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    let command = "getServoAngle(\"" + name + "\")";

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

  const setContinousServoDirection = (name, direction, callback) => {
    let sensor = sensorHandler.findSensorByName(name, true);

    let angle = 90;
    if (direction > 0) {
      angle = 0;
    }
    else if (direction < 0) {
      angle = 180;
    }

    context.registerQuickPiEvent(name, angle);
    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let command = "setServoAngle(\"" + name + "\"," + angle + ")";
      const cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  return {
    setServoAngle: {
      category: 'actuator',
      blocks: [
        {
          name: "setServoAngle",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='setServoAngle'>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: setServoAngle,
        },
      ],
    },
    getServoAngle: {
      category: 'actuator',
      blocks: [
        {
          name: "getServoAngle",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")},
            ]
          },
          handler: getServoAngle,
        },
      ],
    },
    setContinousServoDirection: {
      category: 'actuator',
      blocks: [
        {
          name: "setContinousServoDirection",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("servo")},
              {"type": "field_dropdown", "name": "PARAM_1", "options": [["forward", "1"], ["backwards", "-1"], ["stop", "0"]]},
            ]
          },
          handler: setContinousServoDirection,
        },
      ],
    },
  } satisfies ModuleDefinition;
}