declare global {
  interface Window {
    modulesPath: string;
    currentOutput: any,
    exec: any,
    zen3d: any,
    displayHelper: {
      popupMessageShown: boolean,
      showPopupDialog: (popup: string, callback: () => void) => void,
      showPopupMessage: (message: string, type: string) => void,
    },
    task: any,
    localLanguageStrings: any,
    quickAlgoContext: (display: boolean, infos: any) => any,
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

export interface QuickalgoLibraryBlock {
  name: string,
  yieldsValue?: boolean,
  params?: string[],
  blocklyJson?: any,
  anyArgs?: boolean,
  variants?: any,
}

export interface QuickalgoLibrary {
  display: boolean;
  placeholderBlocks: any;
  iTestCase: number; // Required for some libs such as barcode
  nbCodes: number;
  nbNodes: number;
  nbMoves?: number;
  strings: any;
  customBlocks: {[generatorName: string]: {[categoryName: string]: QuickalgoLibraryBlock[]}};
  customConstants: {[generatorName: string]: {name: string, value: any}[]};
  customClasses: {[generatorName: string]: {[categoryName: string]: {[className: string]: any[]}}};
  customClassInstances: {[generatorName: string]: {[instanceName: string]: string}};
  conceptList: any[];
  conceptDisabledList?: string[];
  curNode: any;
}

export {};
