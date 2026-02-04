import {ModuleDefinition} from "./module_definition";
import {QuickalgoLibrary} from "../definitions";

export function pwmModuleDefinition(context: QuickalgoLibrary) {
  const pwmDuty = (self, duty, resolution, callback) => {
    const sensor = context.sensorHandler.findSensorByPort(`D${self.pin.pinNumber}`);
    if (!sensor) {
      throw `There is no sensor connected to the digital port D${self.pin.pinNumber}`;
    }

    const sensorDef = context.sensorHandler.findSensorDefinition(sensor);
    if (!sensorDef.getStateFromPwm) {
      throw "This sensor may not be controlled by a PWM";
    }

    const newState = sensorDef.getStateFromPwm(duty, resolution);

    let command = "pwmDuty(" + self.pin.pinNumber + ", " + duty + ", " + resolution + ")";
    self.currentDuty = duty;

    context.registerQuickPiEvent(sensor.name, newState);

    if (!context.display || context.autoGrading || context.offLineMode) {
      context.waitDelay(callback);
    } else {
      let cb = context.runner.waitCallback(callback);

      context.quickPiConnection.sendCommand(command, cb);
    }
  };

  const pwmConstructor = function* (self, pin, freq, duty) {
    self.pin = pin;
    self.freq = freq;
    self.currentDuty = duty;
  };

  const duty = function (self, duty, callback) {
    pwmDuty(self, duty, Math.pow(2, 10), callback);
  };

  const dutyU16 = function (self, duty, callback) {
    pwmDuty(self, duty, Math.pow(2, 16), callback);
  };

  return {
    pwmInit: {
      category: 'actuator',
      classMethods: {
        PWM: {
          defaultInstanceName: 'pwm',
          init: {
            params: [null, "Number", "Number"],
            handler: pwmConstructor,
          },
        },
      },
    },
    pwmDuty: {
      category: 'actuator',
      classMethods: {
        PWM: {
          defaultInstanceName: 'pwm',
          methods: {
            duty: {
              params: ["Number"],
              handler: duty,
            },
          },
        },
      },
    },
    pwmDutyU16: {
      category: 'actuator',
      classMethods: {
        PWM: {
          defaultInstanceName: 'pwm',
          methods: {
            duty_u16: {
              params: ["Number"],
              handler: dutyU16,
            },
          },
        },
      },
    },
  } satisfies ModuleDefinition;
}