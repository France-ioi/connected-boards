import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorServo extends AbstractSensor {
  private pale: any;
  private center: any;
  private updatetimeout: any;
  public type = 'servo';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "servo",
      suggestedName: strings.messages.sensorNameServo,
      description: strings.messages.servo,
      isAnalog: true,
      isSensor: false,
      portType: "D",
      valueType: "number",
      pluggable: true,
      valueMin: 0,
      valueMax: 180,
      selectorImages: ["servo.png", "servo-pale.png", "servo-center.png"],
      getPercentageFromState: function (state) {
        return state / 180;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 180);
      },
      getStateString: function(state) {
        return "" + state + "°";
      },
      getStateFromPwm: function (pwmDuty) {
        return 180*(pwmDuty - 0.025*1023) / (0.1 * 1023);
      },
    };
  }

  getInitialState() {
    return 0;
  }

  setLiveState(state, callback) {
    var command = "setServoAngle(\"" + this.name + "\"," + state + ")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('servo.png'), imgx, imgy, imgw, imgh);

    if (!this.pale || sensorHandler.isElementRemoved(this.pale))
      this.pale = this.context.paper.image(getImg('servo-pale.png'), imgx, imgy, imgw, imgh);


    if (!this.center || sensorHandler.isElementRemoved(this.center))
      this.center = this.context.paper.image(getImg('servo-center.png'), imgx, imgy, imgw, imgh);

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
    this.center.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    this.pale.rotate(this.state);

    if (this.state == null)
      this.state = 0;

    this.state = Math.round(this.state);

    this.stateText = this.context.paper.text(state1x, state1y, this.state + "°");

    if ((!this.context.runner || !this.context.runner.isRunning())
      && !this.context.offLineMode) {
      if (!this.updatetimeout) {
        this.updatetimeout = setTimeout(() => {
          this.setLiveState(this.state, function () {
          });

          this.updatetimeout = null;
        }, 100);
      }
    }

    if (!this.context.autoGrading &&
      (!this.context.runner || !this.context.runner.isRunning())) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 180);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
