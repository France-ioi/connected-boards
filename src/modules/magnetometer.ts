import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function magnetometerModuleDefinition(context: QuickalgoLibrary, strings) {
  const sensorHandler = context.sensorHandler;

  const readMagneticForce = function (axis, callback) {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType("magnetometer");

      let index = 0;
      if (axis == "x")
        index = 0;
      else if (axis == "y")
        index = 1;
      else if (axis == "z")
        index = 2;

      context.waitDelay(callback, sensor.state[index]);
    } else {
      let cb = context.runner.waitCallback(callback);

      let command = "readMagneticForce(\"" + axis + "\")";
      context.quickPiConnection.sendCommand(command, function (returnVal) {
        cb(Number(returnVal));
      });
    }
  };

  const computeCompassHeading = function (callback) {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType("magnetometer");

      let heading = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

      heading = Math.round(heading);

      context.runner.noDelay(callback, heading);
    } else {
      let cb = context.runner.waitCallback(callback);
      let sensor = sensorHandler.findSensorByType("magnetometer");

      context.quickPiConnection.sendCommand("readMagnetometerLSM303C()", function(returnVal) {
        sensor.state = JSON.parse(returnVal);
        sensorHandler.drawSensor(sensor);

        returnVal = Math.atan2(sensor.state[0],sensor.state[1])*(180/Math.PI) + 180;

        returnVal = Math.floor(returnVal);

        cb(returnVal);
      }, true);
    }
  };

  return {
    readMagneticForce: {
      category: 'sensors',
      blocks: [
        {
          name: "readMagneticForce",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"] ]
              }
            ]
          },
          handler: readMagneticForce,
        },
      ],
      classMethods: {
        Compass: {
          instances: ['compass'],
          methods: {
            get_x: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readMagneticForce('x', callback);
              },
            },
            get_y: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readMagneticForce('y', callback);
              },
            },
            get_z: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                readMagneticForce('z', callback);
              },
            },
          },
        },
      },
    },
    computeCompassHeading: {
      category: 'sensors',
      blocks: [
        {
          name: "computeCompassHeading",
          yieldsValue: 'int',
          handler: computeCompassHeading,
        },
      ],
      classMethods: {
        Compass: {
          instances: ['compass'],
          methods: {
            heading: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                computeCompassHeading(callback);
              },
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}
