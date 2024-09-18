import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorSound extends AbstractSensor<any> {
  public type = 'sound';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "sound",
      suggestedName: strings.messages.sensorNameMicrophone,
      description: strings.messages.soundsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["sound.png"],
      getPercentageFromState: function (state) {
        return state / 100;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 100);
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readSoundLevel(\"" + this.name + "\")", function(val) {
      val = Math.round(val);
      callback(val);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (this.state == null)
      this.state = 25; // FIXME

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('sound.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    // if we just do sensor.state, if it is equal to 0 then the state is not displayed
    if (this.state != null) {
      this.stateText = this.context.paper.text(state1x, state1y, this.state + " dB");
    }

    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 60);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }

  }
}
