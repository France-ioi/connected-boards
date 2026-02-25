import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function motorModuleDefinition(context: QuickalgoLibrary) {
  const sensorHandler = context.sensorHandler;

  const setMotorSpeed = (name, speed, callback) => {
    sensorHandler.findSensorByName(name, true);

    context.registerQuickPiEvent(name, speed);
    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let command = "setMotorSpeed(\"" + name + "\"," + speed + ")";
      const cb = context.runner.waitCallback(callback);
      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  return {
    setMotorSpeed: {
      category: 'actuator',
      blocks: [
        {
          name: "setMotorSpeed",
          params: ["String", "Number"],
          blocklyJson: {
            "args0": [
              {"type": "field_dropdown", "name": "PARAM_0", "options": sensorHandler.getSensorNames("motor")},
              {"type": "input_value", "name": "PARAM_1"},
            ]
          },
          blocklyXml: "<block type='setMotorSpeed'>" +
            "<value name='PARAM_1'><shadow type='math_number'></shadow></value>" +
            "</block>",
          handler: setMotorSpeed,
        },
      ],
    },
  } satisfies ModuleDefinition;
}
