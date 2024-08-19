import {ModuleDefinition} from "../module_definition";

export function machinePinModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    classDefinitions: {
      actuator: { // category name
        Pin: {
          init: {params: ["Number", "Number"]},
          blocks: [
            {name: "on"},
            {name: "off"},
          ],
          constants: [
            {name: "IN", value: 1},
            {name: "OUT", value: 3},
          ],
        }
      }
    },
    classImplementations: {
      Pin: {
        __constructor: function* (self, pinNumber, mode) {
          self.pinNumber = pinNumber;
          self.mode = mode;
        },
        on: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByPort(`D${self.pinNumber}`);
          if (!sensor) {
            throw `There is no sensor connected to the digital port D${self.pinNumber}`;
          }

          let command = "turnPortOn(\"" + sensor.name + "\")";

          context.registerQuickPiEvent(sensor.name, true);

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let cb = context.runner.waitCallback(callback);

            context.quickPiConnection.sendCommand(command, cb);
          }
        },
        off: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByPort(`D${self.pinNumber}`);
          if (!sensor) {
            throw `There is no sensor connected to the digital port D${self.pinNumber}`;
          }

          let command = "turnPortOff(\"" + sensor.name + "\")";

          context.registerQuickPiEvent(sensor.name, false);

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
