import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function lightModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readLightIntensity = function (name, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);

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
    readLightIntensity: {
      category: 'sensors',
      blocks: [
        {
          name: "readLightIntensity",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("light")
              }
            ]
          },
          handler: readLightIntensity,
        },
      ],
    },
    lightIntensity: {
      category: 'sensors',
      blocks: [
        {
          name: "lightIntensity",
          yieldsValue: 'int',
          handler: function (callback) {
            const sensor = context.sensorHandler.findSensorByType('light');
            readLightIntensity(sensor.name, callback);
          },
        },
      ],
      classMethods: {
        Display: {
          instances: ['display'],
          methods: {
            read_light_level: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                const sensor = context.sensorHandler.findSensorByType('light');
                readLightIntensity(sensor.name, callback);
              },
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}
