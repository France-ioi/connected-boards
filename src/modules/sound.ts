import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function soundModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const readSoundLevel = function (name, callback) {
    let sensor = sensorHandler.findSensorByName(name, true);

    if (!context.display || context.autoGrading || context.offLineMode) {
      let state = context.getSensorState(name);

      context.runner.noDelay(callback, state);
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
    readSoundLevel: {
      category: 'sensors',
      blocks: [
        {
          name: "readSoundLevel",
          yieldsValue: 'int',
          params: ["String"],
          blocklyJson: {
            "args0": [
              {
                "type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("sound")
              }
            ]
          },
          handler: readSoundLevel,
        },
      ],
    },
    soundLevel: {
      category: 'sensors',
      blocks: [
        {
          name: "soundLevel",
          yieldsValue: 'int',
          handler: function (callback) {
            const sensor = context.sensorHandler.findSensorByType('sound');
            readSoundLevel(sensor.name, callback);
          },
        },
      ],
      classMethods: {
        Microphone: {
          instances: ['microphone'],
          methods: {
            sound_level: {
              yieldsValue: 'int',
              handler: function (self, callback) {
                const sensor = context.sensorHandler.findSensorByType('sound');
                readSoundLevel(sensor.name, callback);
              },
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}
