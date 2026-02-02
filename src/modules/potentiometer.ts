import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorPotentiometer} from "../sensors/potentiometer";

export function potentiometerModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readRotaryAngle = (name, callback) => {
    let sensor = sensorHandler.findSensorByName<SensorPotentiometer>(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);
      context.waitDelay(callback, state);
    } else {
      let cb = context.runner.waitCallback(callback);

      sensor.getLiveState(function(returnVal) {
        sensor.state = returnVal;
        sensorHandler.drawSensor(sensor);
        cb(returnVal);
      });
    }
  };

  return {
    readRotaryAngle: {
      category: 'sensors',
      blocks: [
        {
          name: "readRotaryAngle",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("potentiometer")},
            ]
          },
          handler: readRotaryAngle,
        },
      ],
    },
  } satisfies ModuleDefinition;
}