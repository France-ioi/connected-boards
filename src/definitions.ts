import {SensorCollection} from "./sensors/sensor_collection";
import {AbstractSensor} from "./sensors/abstract_sensor";
import {AbstractBoard} from "./boards/abstract_board";

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
    OffscreenCanvas: any,
    Raphael: any,
    SimpleGraphDrawer: any,
    VisualGraph: any,
    GraphMouse: any,
    PaperMouseEvent: any,
    Beav: any,
    Graph: any,
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
  showAsAnalog?: boolean,
  isDrawingScreen?: boolean,
}

export interface BoardDefinition {
  name: string,
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
  display: boolean,
  placeholderBlocks: any,
  iTestCase: number, // Required for some libs such as barcode
  nbCodes: number;
  nbNodes: number;
  nbMoves?: number,
  strings: any,
  customBlocks: {[generatorName: string]: {[categoryName: string]: QuickalgoLibraryBlock[]}},
  customConstants: {[generatorName: string]: {name: string, value: any}[]},
  customClasses: {[generatorName: string]: {[categoryName: string]: {[className: string]: any[]}}},
  customClassInstances: {[generatorName: string]: {[instanceName: string]: string}},
  conceptList: any[],
  conceptDisabledList?: string[],
  curNode: any,
  paper: any,
  runner: any,
  offLineMode: boolean,
  autoGrading: boolean,
  quickPiConnection: any,
  sensorsList: SensorCollection,
  sensorAdder: any,
  stopLiveUpdate: boolean,
  resetSensorTable: () => void,
  resetDisplay: () => void,
  remoteIRcodes: {[preset: string]: any},
  board: string,
  findSensor: (type: string, port: string, error: boolean) => AbstractSensor,
  useportforname: boolean,
  compactLayout: boolean,
  sensorsSaved: {[name: string]: any},
  sensorStateListener: any,
  mainBoard: AbstractBoard,
  quickpi: any,
  currentTime: number,
}

export interface QuickAlgoConstant {
  name: string,
  value: any,
}

export interface QuickAlgoCustomClass {
  defaultInstanceName?: string,
  init?: QuickalgoLibraryBlock,
  blocks: QuickalgoLibraryBlock[],
  constants?: QuickAlgoConstant[],
}

export interface BoardCustomBlocks {
  customBlocks?: {[generatorName: string]: {[categoryName: string]: QuickalgoLibraryBlock[]}},
  customConstants?: {[generatorName: string]: {name: string, value: any}[]},
  customClasses?: {[generatorName: string]: {[categoryName: string]: {[className: string]: QuickAlgoCustomClass}}},
  customClassInstances?: {[generatorName: string]: {[instanceName: string]: string}},

  customBlockImplementations?: {[generatorName: string]: {[blockName: string]: Function}},
  customClassImplementations?: {[generatorName: string]: {[className: string]: {[methodName: string]: Function}}},
}

export interface SensorDefinition {
  name?: string,
  suggestedName?: string,
  subType?: string,
  description?: string,
  isAnalog?: boolean,
  isSensor?: boolean,
  portType?: string,
  getInitialState?: (sensor: Sensor) => any,
  selectorImages?: string[],
  valueType?: string,
  pluggable?: boolean,
  getPercentageFromState?: (state: any, sensor?: Sensor) => number,
  getStateFromPercentage?: (percentage: number) => any,
  getStateFromPwm?: (pwmDuty: number) => any,
  getLiveState?: (sensor: Sensor, callback: (state: any) => void) => void,
  setLiveState?: (sensor: Sensor, state: any, callback: () => void) => void,
  getStateString?: (state: any) => string,
  subTypes?: SensorDefinition[],
  valueMin?: number,
  valueMax?: number,
  step?: number,
  cellsAmount?: (paper: any) => number,
  compareState?: (state1: any, state2: any) => boolean,
  getWrongStateString?: (failInfo: any) => string,
  gpiosNames?: string[],
  gpios?: number[],
  getButtonState?: (buttonname: string, state: any) => boolean,
}

export {};
