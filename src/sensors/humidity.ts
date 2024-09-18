import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorHumidity extends AbstractSensor<any> {
  public type = 'humidity';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "humidity",
      suggestedName: strings.messages.sensorNameHumidity,
      description: strings.messages.humiditysensor,
      isAnalog: true,
      isSensor: true,
      portType: "D",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["humidity.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readHumidity(\"" + this.name + "\")", function(val) {
      val = Math.round(val);
      callback(val);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('humidity.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    if (this.state == null)
      this.state = 0;

    this.stateText = this.context.paper.text(state1x, state1y, this.state + "%");
    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 100);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
