import {ModuleDefinition} from "../module_definition";

export function machinePwmModuleDefinition(context: any, strings): ModuleDefinition {
  return {
    classDefinitions: {
      actuator: { // category name
        PWM: {
          defaultInstanceName: 'pwm',
          init: {params: [null, "Number", "Number"]},
          blocks: [
            {name: "duty", params: ["Number"]},
          ],
        }
      }
    },
    classImplementations: {
      PWM: {
        __constructor: function* (self, pin, freq, duty) {
          self.pin = pin;
          self.freq = freq;
          self.duty = duty;
        },
        duty: function (self, dutyValue, callback) {
          const sensor = context.sensorHandler.findSensorByPort(`D${self.pinNumber}`);
          if (!sensor) {
            throw `There is no sensor connected to the digital port D${self.pinNumber}`;
          }

          let command = "pwmDuty(\"" + sensor.name + "\", " + dutyValue + ")";

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
