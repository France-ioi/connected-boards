import {AbstractSensor} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {getImg} from "../util";
import {SensorHandler} from "./util/sensor_handler";

export class SensorLed extends AbstractSensor {
  private ledon: any;
  private ledoff: any;
  private stateText: any;
  protected type = 'led';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "led",
      suggestedName: strings.messages.sensorNameLed,
      description: strings.messages.led,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      getInitialState: function (sensor) {
        return false;
      },
      selectorImages: ["ledon-red.png"],
      valueType: "boolean",
      pluggable: true,
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },

      getStateString: function(state) {
        return state ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase();
      },
      subTypes: [{
        subType: "blue",
        description: strings.messages.blueled,
        selectorImages: ["ledon-blue.png"],
        suggestedName: strings.messages.sensorNameBlueLed,
      },
        {
          subType: "green",
          description: strings.messages.greenled,
          selectorImages: ["ledon-green.png"],
          suggestedName: strings.messages.sensorNameGreenLed,
        },
        {
          subType: "orange",
          description: strings.messages.orangeled,
          selectorImages: ["ledon-orange.png"],
          suggestedName: strings.messages.sensorNameOrangeLed,
        },
        {
          subType: "red",
          description: strings.messages.redled,
          selectorImages: ["ledon-red.png"],
          suggestedName: strings.messages.sensorNameRedLed,
        }
      ],
    };
  }

  setLiveState (state, callback) {
    var ledstate = state ? 1 : 0;
    var command = "setLedState(\"" + this.name + "\"," + ledstate + ")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {fadeopacity, sensorAttr, imgx, imgy, imgw, imgh, state1x, state1y}) {
    if (this.stateText)
      this.stateText.remove();

    if (this.state == null)
      this.state = 0;

    if (!this.ledoff || sensorHandler.isElementRemoved(this.ledoff)) {
      this.ledoff = this.context.paper.image(getImg('ledoff.png'), imgx, imgy, imgw, imgh);

      this.focusrect.click(() => {
        if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
          this.state = !this.state;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.drawSensor(this);
        } else {
          sensorHandler.actuatorsInRunningModeError();
        }
      });
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

    if (this.showAsAnalog) {
      this.stateText = this.context.paper.text(state1x, state1y, this.state);
    } else {
      if (this.state) {
        this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
      } else {
        this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
      }
    }

    if (this.state) {
      this.ledon.attr({"opacity": fadeopacity});
      this.ledoff.attr({"opacity": 0});
    } else {
      this.ledon.attr({"opacity": 0});
      this.ledoff.attr({"opacity": fadeopacity});
    }

    // let x = typeof sensor.state;

    if (typeof this.state == 'number') {
      this.ledon.attr({"opacity": this.state * fadeopacity});
      this.ledoff.attr({"opacity": fadeopacity});
    }

    if ((!this.context.runner || !this.context.runner.isRunning()) && !this.context.offLineMode) {
      this.setLiveState(this.state, function () {
      });
    }
  }
}
