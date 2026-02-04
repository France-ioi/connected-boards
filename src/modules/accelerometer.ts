import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorAccelerometer} from "../sensors/accelerometer";

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
      let sensor = sensorHandler.findSensorByType<SensorAccelerometer>("accelerometer");

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

  const computeRotation = (rotationType, callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType<SensorAccelerometer>("accelerometer");

      let zsign = 1;
      let result = 0;

      if (sensor.state[2] < 0)
        zsign = -1;

      if (rotationType == "pitch")
      {
        result = 180 * Math.atan2 (sensor.state[0], zsign * Math.sqrt(sensor.state[1]*sensor.state[1] + sensor.state[2]*sensor.state[2]))/Math.PI;
      }
      else if (rotationType == "roll")
      {
        result = 180 * Math.atan2 (sensor.state[1], zsign * Math.sqrt(sensor.state[0]*sensor.state[0] + sensor.state[2]*sensor.state[2]))/Math.PI;
      }

      result = Math.round(result);

      context.waitDelay(callback, result);
    } else {
      let cb = context.runner.waitCallback(callback);
      let command = "computeRotation(\"" + rotationType + "\")";

      context.quickPiConnection.sendCommand(command, function (returnVal) {
        cb(returnVal);
      });
    }
  };

  const wasGesture = function (gesture, callback) {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType<SensorAccelerometer>("accelerometer");
      let state = context.getSensorState(sensor.name);
      const wasGesture = state[3];
      context.waitDelay(callback, wasGesture === gesture);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "wasGesture(\"" + gesture + "\")";
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
     computeRotation: {
      category: 'sensors',
      blocks: [
        {
          name: "computeRotation",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": [["pitch", "pitch"], ["roll", "roll"]]
              }
            ]
          },
          handler: computeRotation,
        },
      ],
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
