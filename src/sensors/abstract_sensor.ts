import {QuickalgoLibrary} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";

export interface SensorDrawParameters {
  fadeopacity: number,
  sensorAttr: object,
  x: number,
  y: number,
  w: number,
  h: number,
  cx: number,
  cy: number,
  imgx: number,
  imgy: number,
  imgw: number,
  imgh: number,
  state1x: number,
  state1y: number,
  statesize: number,
  stateanchor: string,
  juststate: boolean,
  portx: number,
  porty: number,
  portsize: number,
  drawName: boolean,
  drawPortText: boolean,
  fontWeight: string,
  namex: number,
  namey: number,
  namesize: number,
  nameanchor: string,
  scrolloffset: number,
}

export interface SensorDrawTimeLineParameters {
  startx: number,
  ypositionmiddle: number,
  color: string,
  strokewidth: number,
  ypositiontop: number,
  drawnElements: any[],
  deleteLastDrawnElements: boolean,
  stateLenght: number,
  startTime: number,
  endTime: number,
}

export abstract class AbstractSensor<T> {
  public callsInTimeSlot?: number;
  public drawInfo?: {
    x: number,
    y: number,
    width: number,
    height: number,
  };
  public focusrect?: any;
  public hasslider?: boolean;
  public img?: any;
  public lastDrawnState?: any;
  public lastDrawnTime?: number;
  public lastTimeIncrease?: number;
  public maxAnalog?: number;
  public minAnalog?: number;
  public name?: string;
  public nameText?: any;
  public type: string;
  public subType?: string;
  public suggestedName?: string;
  public port?: string;
  public state?: T;
  public builtin?: boolean;
  public showAsAnalog?: boolean;
  public isDrawingScreen?: boolean;
  public removed?: boolean;
  public stateText: any;
  public timelinelastxlabel?: number[];
  public lastAnalogState?: any;
  public context: QuickalgoLibrary;
  public lastState?: T;
  public showingTooltip?: boolean;

  protected strings: any;

  constructor(sensorData: any, context: QuickalgoLibrary, strings: any) {
    this.context = context;
    this.strings = strings;
    for (let [key, value] of Object.entries(sensorData)) {
      this[key] = value;
    }
  }

  public abstract draw(sensorHandler: SensorHandler, parameters: SensorDrawParameters): void;
  public setLiveState?(state: T, callback): void;
  public getInitialState?(): T;

  // public drawTimelineState(sensorHandler: SensorHandler, state: any, expectedState: any, type: string, drawParameters: SensorDrawTimeLineParameters): void {
  //
  // };
}
