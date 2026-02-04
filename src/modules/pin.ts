import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function pinModuleDefinition(context: QuickalgoLibrary) {
  const pinConstructor = function* () {
    const args = [...arguments];
    const callback = args.pop();
    const [self, pinNumber, mode] = args;

    self.pinNumber = pinNumber;
    self.mode = mode ?? 3; // Pin.OUT
  };

  const pinOn = function (self, callback) {
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
  };

  const pinOff = function (self, callback) {
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
  };

  return {
    machinePin: {
      category: 'actuator',
      classMethods: {
        Pin: {
          defaultInstanceName: 'pin',
          init: {
            variants: [["Number"], ["Number", "Number"]],
            handler: pinConstructor,
          },
          methods: {
            on: {
              handler: pinOn,
            },
            off: {
              handler: pinOff,
            },
          },
        },
      },
      classConstants: {
        Pin: {
          IN: '1',
          OUT: '3',
        },
      },
    },
  } satisfies ModuleDefinition;
}