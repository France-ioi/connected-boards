import {ModuleDefinition} from "../module_definition";

export function machinePulseModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    blockDefinitions: {
      sensors: [
        {
          name: 'time_pulse_us', params: [null, 'Number', 'Number'], yieldsValue: 'int',
        },
      ]
    },
    blockImplementations: {
      time_pulse_us: function (pin, pulseLevel, timeoutUs, callback) {
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
      }
    },
  }
}
