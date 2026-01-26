import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

const gesturesList = {
  shake: 'shake',
  up: 'logo up',
  down: 'logo down',
  'face up': 'face up',
  'face down': 'face down',
  left: 'left',
  right: 'right',
  freefall: 'freefall',
  '3g': '3g',
};

export function accelerometerModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const readAcceleration = function (axis, callback) {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType("accelerometer");

      let index = 0;
      if (axis == "x")
        index = 0;
      else if (axis == "y")
        index = 1;
      else if (axis == "z")
        index = 2;

      let state = context.getSensorState(sensor.name);

      if (Array.isArray(state))
        context.waitDelay(callback, state[index]);
      else
        context.waitDelay(callback, 0);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "readAcceleration(\"" + axis + "\")";
      context.quickPiConnection.sendCommand(command, function (returnVal) {
        cb(Number(returnVal));
      });
    }
  };

  const wasGesture = function (axis, callback) {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType("accelerometer");

      // let state = context.getSensorState(sensor.name);

      context.waitDelay(callback, false);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "wasGesture(\"" + axis + "\")";
      context.quickPiConnection.sendCommand(command, function (returnVal) {
        cb(!!returnVal);
      });
    }
  };

  return {
    readAcceleration: {
      category: 'sensors',
      blocks: [
        {
          name: "readAcceleration",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
              }
            ]
          },
          handler: readAcceleration,
        },
      ],
      classMethods: {
        Accel: {
          instances: ['accelerometer'],
          methods: {
            get_x: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readAcceleration('x', callback);
              },
            },
            get_y: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readAcceleration('y', callback);
              },
            },
            get_z: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readAcceleration('z', callback);
              },
            },
          },
        },
      },
    },
    wasGesture: {
      category: 'sensors',
      blocks: [
        {
          name: "wasGesture",
          yieldsValue: 'bool',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": Object.entries(gesturesList),
              }
            ]
          },
          handler: wasGesture,
        },
      ],
      classMethods: {
        Accel: {
          instances: ['accelerometer'],
          methods: {
            was_gesture: {
              params: ["String"],
              yieldsValue: 'bool',
              handler: function (self, gesture, callback) {
                wasGesture(gesture, callback);
              },
            },
          },
        },
      },
    }
  } satisfies ModuleDefinition;
}
