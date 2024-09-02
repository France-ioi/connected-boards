import {AbstractSensor} from "./abstract_sensor";

export class SensorCollection {
  private entries: AbstractSensor[] = [];

  public add(sensor: AbstractSensor) {
    this.entries.push(sensor);
  }

  public unshift(sensor: AbstractSensor) {
    this.entries.unshift(sensor);
  }

  public all(): AbstractSensor[] {
    return this.entries;
  }

  public size(): number {
    return this.entries.length;
  }

  // public filterBy...() {
  //
  // }
}
