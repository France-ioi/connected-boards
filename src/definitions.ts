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
    Blockly: any,
    quickAlgoLibraries: any,
    quickAlgoLibrariesList: any,
    quickAlgoResponsive: boolean,
    stringsLanguage: any,
    quickAlgoInterface: any,
  }
}

export interface Sensor {
  callsInTimeSlot?: number,
  drawInfo?: {
    x: number,
    y: number,
    width: number,
    height: number,
  },
  focusrect?: any,
  hasslider?: boolean,
  img?: any,
  lastDrawnState?: any,
  lastDrawnTime?: number,
  lastTimeIncrease?: number,
  maxAnalog?: number,
  minAnalog?: number,
  name?: string,
  nameText?: any,
  type: string,
  subType?: string,
  suggestedName?: string,
  port?: string,
  state?: any,
  builtin?: boolean,
}

export interface BoardDefinition {
  name: string,
  friendlyName?: string,
  image?: string,
  adc?: string|string[],
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
  name?: string,
  yieldsValue?: string|boolean,
  params?: string[],
  blocklyJson?: any,
  blocklyXml?: string,
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
