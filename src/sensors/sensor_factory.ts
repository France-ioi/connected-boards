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
import {SensorAccelerometer} from "./accelerometer";
import {SensorClock} from "./clock";
import {SensorCloudStore} from "./cloudstore";
import {SensorGyroscope} from "./gyroscope";
import {SensorHumidity} from "./humidity";
import {SensorIrRecv} from "./irrecv";
import {SensorLight} from "./light";
import {SensorMagnetometer} from "./magnetometer";
import {SensorPotentiometer} from "./potentiometer";
import {SensorRange} from "./range";
import {SensorSound} from "./sound";
import {SensorTemperature} from "./temperature";
import {SensorWifi} from "./wifi";

export const sensorsList = {
  accelerometer: SensorAccelerometer,
  button: SensorButton,
  buzzer: SensorBuzzer,
  clock: SensorClock,
  cloudstore: SensorCloudStore,
  gyroscope: SensorGyroscope,
  humidity: SensorHumidity,
  irrecv: SensorIrRecv,
  irtrans: SensorIrTrans,
  led: SensorLed,
  leddim: SensorLedDim,
  ledmatrix: SensorLedMatrix,
  ledrgb: SensorLedRgb,
  light: SensorLight,
  magnetometer: SensorMagnetometer,
  potentiometer: SensorPotentiometer,
  range: SensorRange,
  screen: SensorScreen,
  servo: SensorServo,
  sound: SensorSound,
  stick: SensorStick,
  temperature: SensorTemperature,
  wifi: SensorWifi,
};

export function createSensor(sensor: Sensor, context: QuickalgoLibrary, strings: any) {
  if (sensor.type in sensorsList) {
    return new sensorsList[sensor.type](sensor, context, strings);
  }

  return {
    ...sensor,
  };
}
