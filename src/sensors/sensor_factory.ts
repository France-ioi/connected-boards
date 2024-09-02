import {SensorLed} from "./led";
import {QuickalgoLibrary, Sensor} from "../definitions";

export const sensorsList = {
  led: SensorLed,
};

export function createSensor(sensor: Sensor, context: QuickalgoLibrary, strings: any) {
  if (sensor.type in sensorsList) {
    return new sensorsList[sensor.type](sensor, context, strings);
  }

  return {
    ...sensor,
  };
}
