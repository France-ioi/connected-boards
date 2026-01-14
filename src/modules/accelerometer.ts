import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

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
    }
  } satisfies ModuleDefinition;
}
