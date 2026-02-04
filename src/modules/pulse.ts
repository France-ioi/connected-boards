import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function pulseModuleDefinition(context: QuickalgoLibrary) {
  const timePulseUs = function (pin, pulseLevel, timeoutUs, callback) {
    const sensor = context.sensorHandler.findSensorByPort(`D${pin.pinNumber}`);
    if (!sensor) {
      throw `There is no sensor connected to the digital port D${pin.pinNumber}`;
    }

    let command = "getTimePulseUs(\"" + sensor.name + `", ${pulseLevel}, ${timeoutUs})`;

    if (!context.display || context.autoGrading || context.offLineMode) {
      let distance = context.getSensorState(sensor.name);

      const duration = distance / 343 * 2 / 100 * 1e6;

      context.waitDelay(callback, duration);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  return {
    timePulseUs: {
      category: 'sensors',
      blocks: [
        {
          name: 'time_pulse_us',
          params: [null, 'Number', 'Number'],
          yieldsValue: 'int',
          handler: timePulseUs,
        },
      ],
    },
  } satisfies ModuleDefinition;
}