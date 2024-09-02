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

export abstract class AbstractSensor {
  protected callsInTimeSlot?: number;
  protected drawInfo?: {
    x: number,
    y: number,
    width: number,
    height: number,
  };
  protected focusrect?: any;
  protected hasslider?: boolean;
  protected img?: any;
  protected lastDrawnState?: any;
  protected lastDrawnTime?: number;
  protected lastTimeIncrease?: number;
  protected maxAnalog?: number;
  protected minAnalog?: number;
  protected name?: string;
  protected nameText?: any;
  protected type: string;
  protected subType?: string;
  protected suggestedName?: string;
  protected port?: string;
  protected state?: any;
  protected builtin?: boolean;
  protected showAsAnalog?: boolean;
  protected isDrawingScreen?: boolean;
  protected removed?: boolean;
  protected stateText: any;

  protected context: QuickalgoLibrary;
  protected strings: any;

  constructor(sensorData: any, context: QuickalgoLibrary, strings: any) {
    this.context = context;
    this.strings = strings;
    for (let [key, value] of Object.entries(sensorData)) {
      this[key] = value;
    }
  }

  public abstract draw(sensorHandler: SensorHandler, parameters: SensorDrawParameters): void;
}
