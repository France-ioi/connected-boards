import {AbstractSensor} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {getImg} from "../util";
import {SensorHandler} from "./util/sensor_handler";

export class SensorLedRgb extends AbstractSensor {
  private ledimage: any;
  private ledcolor: any;
  protected type = 'ledrgb';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "ledrgb",
      suggestedName: strings.messages.sensorNameLedRgb,
      description: strings.messages.ledrgb,
      isAnalog: true,
      isSensor: false,
      portType: "D",
      selectorImages: ["ledon-red.png"],
      valueType: "object",
      valueMin: 0,
      valueMax: 255,
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state)
          return state / 255;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return Math.round(percentage * 255);
        else
          return 0;
      },
      getStateString: function(state) {
        return `[${state.join(', ')}]`;
      },
    };
  }

  setLiveState (state, callback) {
    var command = `setLedRgbState("${this.name}", [0, 0, 0])`;

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  getInitialState() {
    return [0, 0, 0];
  }

  draw(sensorHandler: SensorHandler, {sensorAttr, imgx, imgy, imgw, imgh, state1x, state1y, juststate}) {
    if (this.stateText)
      this.stateText.remove();

    if (this.state == null)
      this.state = 0;

    if (!this.ledimage || sensorHandler.isElementRemoved(this.ledimage)) {
      let imagename = "ledoff.png";
      this.ledimage = this.context.paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
    }
    if (!this.ledcolor || sensorHandler.isElementRemoved(this.ledcolor)) {
      console.log('new ledcolor');
      this.ledcolor = this.context.paper.circle();
    }

    this.ledimage.attr(sensorAttr);
    this.ledcolor.attr(sensorAttr);
    this.ledcolor.attr({});

    this.ledcolor.attr({
      "cx": imgx + imgw/2,
      "cy": imgy + imgh*0.3,
      "r": imgh*0.15,
      fill: this.state ? `rgb(${this.state.join(',')})`: 'none',
      stroke: 'none',
      opacity: 0.5,
    });

    this.stateText = this.context.paper.text(state1x, state1y, `${this.state ? this.state.join(',') : ''  }`);

    if ((!this.context.runner || !this.context.runner.isRunning())
      && !this.context.offLineMode) {
      this.setLiveState(this.state, function () {
      });
    }

    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 255);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
