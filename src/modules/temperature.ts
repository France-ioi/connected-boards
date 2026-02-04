import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function temperatureModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readTemperature = function (name, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);

      context.runner.waitDelay(callback, state);
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
    readTemperature: {
      category: 'sensors',
      blocks: [
        {
          name: "readTemperature",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("temperature")
              }
            ]
          },
          handler: readTemperature,
        },
      ],
    },
    // This block is without parameter
    temperature: {
      category: 'sensors',
      blocks: [
        {
          name: "temperature",
          yieldsValue: 'int',
          handler: (callback) => {
            const sensor = sensorHandler.findSensorByType('temperature');

            return readTemperature(sensor.name, callback);
          },
        },
      ],
    },
  } satisfies ModuleDefinition;
}
