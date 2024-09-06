import {AbstractSensor} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {getImg} from "../util";
import {SensorHandler} from "./util/sensor_handler";

export class SensorLedDim extends AbstractSensor {
  private ledon: any;
  private ledoff: any;
  public type = 'leddim';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "leddim",
      suggestedName: strings.messages.sensorNameLedDim,
      description: strings.messages.ledDim,
      isAnalog: true,
      isSensor: false,
      portType: "D",
      selectorImages: ["ledon-red.png"],
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 1,
      getPercentageFromState: function (state) {
        return state;
      },
      getStateFromPercentage: function (percentage) {
        return percentage;
      },
      getStateFromPwm: function (duty) {
        return duty / 1023;
      },
      getStateString: function(state) {
        return Math.round(state * 100) + "%";
      },
    };
  }

  setLiveState(state, callback) {
    var ledstate = state ? 1 : 0;
    var command = "setLedState(\"" + this.name + "\"," + ledstate + ")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  getInitialState() {
    return 0;
  }

  draw(sensorHandler: SensorHandler, {fadeopacity, sensorAttr, imgx, imgy, imgw, imgh, state1x, state1y, juststate}) {
    if (this.stateText)
      this.stateText.remove();

    if (this.state == null)
      this.state = 0;

    if (!this.ledoff || sensorHandler.isElementRemoved(this.ledoff)) {
      this.ledoff = this.context.paper.image(getImg('ledoff.png'), imgx, imgy, imgw, imgh);
    }

    if (!this.ledon || sensorHandler.isElementRemoved(this.ledon)) {
      let imagename = "ledon-";
      if (this.subType)
        imagename += this.subType;
      else
        imagename += "red";

      imagename += ".png";
      this.ledon = this.context.paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
    }

    this.ledon.attr(sensorAttr);
    this.ledoff.attr(sensorAttr);

    this.stateText = this.context.paper.text(state1x, state1y, Math.round(100 * this.state) + '%');

    if (this.state) {
      this.ledon.attr({"opacity": fadeopacity});
      this.ledoff.attr({"opacity": 0});
    } else {
      this.ledon.attr({"opacity": 0});
      this.ledoff.attr({"opacity": fadeopacity});
    }

    if (typeof this.state == 'number') {
      this.ledon.attr({"opacity": this.state * fadeopacity});
      this.ledoff.attr({"opacity": fadeopacity});
    }

    if ((!this.context.runner || !this.context.runner.isRunning())
      && !this.context.offLineMode) {

      this.setLiveState(this.state, function () {
      });
    }

    if (!this.context.autoGrading &&
      (!this.context.runner || !this.context.runner.isRunning())) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 1);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
