import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorPotentiometer extends AbstractSensor<any> {
  private pale: any;
  public type = 'potentiometer';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "potentiometer",
      suggestedName: strings.messages.sensorNamePotentiometer,
      description: strings.messages.potentiometer,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["potentiometer.png", "potentiometer-pale.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readRotaryAngle(\"" + this.name + "\")", function(val) {
      val = Math.round(val);
      callback(val);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('potentiometer.png'), imgx, imgy, imgw, imgh);

    if (!this.pale || sensorHandler.isElementRemoved(this.pale))
      this.pale = this.context.paper.image(getImg('potentiometer-pale.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    this.pale.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "transform": "",
      "opacity": fadeopacity,
    });

    if (this.state == null)
      this.state = 0;

    this.pale.rotate(this.state * 3.6);

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
