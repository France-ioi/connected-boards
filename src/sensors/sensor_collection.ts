import {AbstractSensor} from "./abstract_sensor";

export class SensorCollection {
  private entries: AbstractSensor<any>[] = [];

  public add(sensor: AbstractSensor<any>) {
    this.entries.push(sensor);
  }

  public unshift(sensor: AbstractSensor<any>) {
    this.entries.unshift(sensor);
  }

  public all(): AbstractSensor<any>[] {
    return this.entries;
  }

  public size(): number {
    return this.entries.length;
  }

  // public filterBy...() {
  //
  // }
}
