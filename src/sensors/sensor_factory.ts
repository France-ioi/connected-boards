import {SensorLed} from "./led";
import {QuickalgoLibrary, Sensor} from "../definitions";
import {SensorLedRgb} from "./led_rgb";
import {SensorLedDim} from "./led_dim";
import {SensorLedMatrix} from "./led_matrix";
import {SensorButton} from "./button";
import {SensorBuzzer} from "./buzzer";
import {SensorIrTrans} from "./irtrans";
import {SensorScreen} from "./screen";
import {SensorServo} from "./servo";
import {SensorStick} from "./stick";

export const sensorsList = {
  led: SensorLed,
  ledrgb: SensorLedRgb,
  leddim: SensorLedDim,
  ledmatrix: SensorLedMatrix,
  button: SensorButton,
  buzzer: SensorBuzzer,
  irtrans: SensorIrTrans,
  screen: SensorScreen,
  servo: SensorServo,
  stick: SensorStick,
};

export function createSensor(sensor: Sensor, context: QuickalgoLibrary, strings: any) {
  if (sensor.type in sensorsList) {
    return new sensorsList[sensor.type](sensor, context, strings);
  }

  return {
    ...sensor,
  };
}
