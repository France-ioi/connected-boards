import {SensorLed} from "./led";
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
import {AbstractSensor} from "./abstract_sensor";
import {SensorType} from "./sensor_types";
import {SensorMotor} from "./motor";

export const sensorsList: Record<SensorType, typeof AbstractSensor<any>> = {
  [SensorType.Accelerometer]: SensorAccelerometer,
  [SensorType.Button]: SensorButton,
  [SensorType.Buzzer]: SensorBuzzer,
  [SensorType.Clock]: SensorClock,
  [SensorType.CloudStore]: SensorCloudStore,
  [SensorType.Gyroscope]: SensorGyroscope,
  [SensorType.Humidity]: SensorHumidity,
  [SensorType.IrRecv]: SensorIrRecv,
  [SensorType.IrTrans]: SensorIrTrans,
  [SensorType.Led]: SensorLed,
  [SensorType.LedDim]: SensorLedDim,
  [SensorType.LedMatrix]: SensorLedMatrix,
  [SensorType.LedRgb]: SensorLedRgb,
  [SensorType.Light]: SensorLight,
  [SensorType.Magnetometer]: SensorMagnetometer,
  [SensorType.Motor]: SensorMotor,
  [SensorType.Potentiometer]: SensorPotentiometer,
  [SensorType.Range]: SensorRange,
  [SensorType.Screen]: SensorScreen,
  [SensorType.Servo]: SensorServo,
  [SensorType.Sound]: SensorSound,
  [SensorType.Stick]: SensorStick,
  [SensorType.Temperature]: SensorTemperature,
  [SensorType.Wifi]: SensorWifi,
};