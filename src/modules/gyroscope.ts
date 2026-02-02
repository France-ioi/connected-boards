import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorGyroscope} from "../sensors/gyroscope";

export function gyroscopeModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readAngularVelocity = (axis, callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType<SensorGyroscope>("gyroscope");

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
      let sensor = context.findSensor<SensorGyroscope>("gyroscope", "i2c");

      sensor.getLiveState(function(returnVal) {
        sensor.state = returnVal;
        sensorHandler.drawSensor(sensor);

        if (axis == "x")
          returnVal = returnVal[0];
        else if (axis == "y")
          returnVal = returnVal[1];
        else if (axis == "z")
          returnVal = returnVal[2];

        cb(returnVal);
      });
    }
  };

  const setGyroZeroAngle = (callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType<SensorGyroscope>("gyroscope");

      sensor.rotationAngles = [0, 0, 0];
      sensor.lastSpeedChange = new Date();

      context.runner.noDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand("setGyroZeroAngle()", function(returnVal) {
        cb();
      }, true);
    }
  };

  const computeRotationGyro = (axis, callback) => {
    if (!context.display || context.autoGrading || context.offLineMode) {
      let sensor = sensorHandler.findSensorByType<SensorGyroscope>("gyroscope");

      let ret = 0;

      if (sensor.rotationAngles != undefined) {
        for (let i = 0; i < 3; i++)
          sensor.rotationAngles[i] += sensor.state[i] * ((+new Date() - +sensor.lastSpeedChange) / 1000);

        sensor.lastSpeedChange = new Date();

        if (axis == "x")
          ret = sensor.rotationAngles[0];
        else if (axis == "y")
          ret = sensor.rotationAngles[1];
        else if (axis == "z")
          ret = sensor.rotationAngles[2];
      }

      context.runner.noDelay(callback, ret);
    } else {
      let cb = context.runner.waitCallback(callback);
      let sensor = context.findSensor("gyroscope", "i2c");

      context.quickPiConnection.sendCommand("computeRotationGyro()", function(returnVal) {
        returnVal = JSON.parse(returnVal);

        if (axis == "x")
          returnVal = returnVal[0];
        else if (axis == "y")
          returnVal = returnVal[1];
        else if (axis == "z")
          returnVal = returnVal[2];

        cb(returnVal);
      }, true);
    }
  };

  return {
    readAngularVelocity: {
      category: 'sensors',
      blocks: [
        {
          name: "readAngularVelocity",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"]]},
            ]
          },
          handler: readAngularVelocity,
        },
      ],
    },
    setGyroZeroAngle: {
      category: 'sensors',
      blocks: [
        {
          name: "setGyroZeroAngle",
          handler: setGyroZeroAngle,
        },
      ],
    },
    computeRotationGyro: {
      category: 'sensors',
      blocks: [
        {
          name: "computeRotationGyro",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": [["x", "x"], ["y", "y"], ["z", "z"]]},
            ]
          },
          handler: computeRotationGyro,
        },
      ],
    },
  } satisfies ModuleDefinition;
}