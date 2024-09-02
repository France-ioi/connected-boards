import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorClock extends AbstractSensor {
  protected type = 'clock';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "clock",
      description: strings.messages.cloudstore,
      isAnalog: false,
      isSensor: false,
      portType: "none",
      valueType: "object",
      selectorImages: ["clock.png"],
    };
  }

  draw(sensorHandler: SensorHandler, drawParameters: SensorDrawParameters) {
    const {imgx, imgy, imgw, imgh, state1x, state1y} = drawParameters;
    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('clock.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
    });

    this.stateText = this.context.paper.text(state1x, state1y, this.context.currentTime.toString() + "ms");

    drawParameters.drawPortText = false;
    drawParameters.drawName = false;
  }
}
