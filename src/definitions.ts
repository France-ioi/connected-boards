declare global {
  interface Window {
    modulesPath: string;
    $: any,
    currentOutput: any,
    exec: any,
  }
}

export interface Sensor {
  type: string,
  subType?: string,
  suggestedName: string,
  port: string,
}

export interface BoardDefinition {
  name: string,
  friendlyName: string,
  image: string,
  adc: string|string[],
  portTypes: {[type: string]: any[]},
  default?: Sensor[],
  builtinSensors?: Sensor[],
}

export enum ConnectionMethod {
  Local = 'local',
  Wifi = 'wifi',
  WebSerial = 'web_serial',
  Usb = 'usb',
  Bluetooth = 'bt',
}

export {};
