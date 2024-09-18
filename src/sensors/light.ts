import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorLight extends AbstractSensor<any> {
  private moon: any;
  private sun: any;
  public type = 'light';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "light",
      suggestedName: strings.messages.sensorNameLight,
      description: strings.messages.lightsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["light.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readLightIntensity(\"" + this.name + "\")", function(val) {
      val = Math.round(val);
      callback(val);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('light.png'), imgx, imgy, imgw, imgh);

    if (!this.moon || sensorHandler.isElementRemoved(this.moon))
      this.moon = this.context.paper.image(getImg('light-moon.png'), imgx, imgy, imgw, imgh);

    if (!this.sun || sensorHandler.isElementRemoved(this.sun))
      this.sun = this.context.paper.image(getImg('light-sun.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    if (this.state == null)
      this.state = 0;

    if (this.state > 50) {
      let opacity = (this.state - 50) * 0.02;
      this.sun.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": opacity * .80 * fadeopacity
      });
      this.moon.attr({"opacity": 0});
    } else {
      let opacity = (50 - this.state) * 0.02;
      this.moon.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": opacity * .80 * fadeopacity
      });
      this.sun.attr({"opacity": 0});
    }

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
