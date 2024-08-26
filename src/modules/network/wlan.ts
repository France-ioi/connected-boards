import {ModuleDefinition} from "../module_definition";

export function networkWlanModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    constants: [
      {name: 'STA_IF', value: 0},
      {name: 'AP_IF', value: 1},
    ],
    classDefinitions: {
      actuator: { // category name
        WLAN: {
          init: {params: [null, "Number"]},
          blocks: [
            {name: "duty", params: ["Number"]},
          ],
        },
      },
    },
    classImplementations: {
      WLAN: {
        __constructor: function* (self, interfaceId) {
          self.interface = interfaceId;
        },
        active: function (self, duty, callback) {
          const sensor = context.sensorHandler.findSensorByPort(`D${self.pin.pinNumber}`);
          if (!sensor) {
            throw `There is no sensor connected to the digital port D${self.pin.pinNumber}`;
          }

          let command = "pwmDuty(\"" + sensor.name + "\", " + duty + ")";
          self.currentDuty = duty;

          context.registerQuickPiEvent(sensor.name, true);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
      }
    },
  }
}
