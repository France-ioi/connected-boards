import {ModuleDefinition} from "../module_definition";

export function machinePinModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    classDefinitions: {
      actuator: { // category name
        Pin: {
          defaultInstanceName: 'pin',
          init: {variants: [["Number"], ["Number", "Number"]]},
          blocks: [
            {name: "on"},
            {name: "off"},
          ],
          constants: [
            {name: "IN", value: 1},
            {name: "OUT", value: 3},
          ],
        },
      },
    },
    classImplementations: {
      Pin: {
        __constructor: function* () {
          const args = [...arguments];
          const callback = args.pop();
          const [self, pinNumber, mode] = args;

          self.pinNumber = pinNumber;
          self.mode = mode ?? 3; // Pin.OUT
        },
        on: function (self, callback) {
          const sensor = context.sensorHandler.findSensorByPort(`D${self.pinNumber}`);
          if (!sensor) {
            throw `There is no sensor connected to the digital port D${self.pinNumber}`;
          }

          const sensorDef = context.sensorHandler.findSensorDefinition(sensor);
          if (!sensorDef.disablePinControl) {
            context.registerQuickPiEvent(sensor.name, true);
          }

          if (!context.display || context.autoGrading || context.offLineMode) {
            context.waitDelay(callback);
          } else {
            let command = "turnPortOn(\"" + sensor.name + "\")";

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

          const sensorDef = context.sensorHandler.findSensorDefinition(sensor);
          if (!sensorDef.disablePinControl) {
            context.registerQuickPiEvent(sensor.name, false);
          }

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
