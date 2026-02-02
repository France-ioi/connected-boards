import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorRange} from "../sensors/range";

export function rangeModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readDistance = (name, callback) => {
    let sensor = sensorHandler.findSensorByName<SensorRange>(name, true);

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
    readDistance: {
      category: 'sensors',
      blocks: [
        {
          name: "readDistance",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("range")},
            ]
          },
          handler: readDistance,
        },
      ],
    },
  } satisfies ModuleDefinition;
}