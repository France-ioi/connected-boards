import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";
import {SensorHumidity} from "../sensors/humidity";

export function humidityModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readHumidity = (name, callback) => {
    let sensor = sensorHandler.findSensorByName<SensorHumidity>(name, true);

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
    readHumidity: {
      category: 'sensors',
      blocks: [
        {
          name: "readHumidity",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("humidity")},
            ]
          },
          handler: readHumidity,
        },
      ],
    },
  } satisfies ModuleDefinition;
}