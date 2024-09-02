import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorButton extends AbstractSensor {
  private buttonon: any;
  private buttonoff: any;
  private wasPressed: boolean;
  public onPressed: () => void;
  protected type = 'button';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "button",
      suggestedName: strings.messages.sensorNameButton,
      description: strings.messages.button,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "boolean",
      pluggable: true,
      selectorImages: ["buttonoff.png"],
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
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("isButtonPressed(\"" + this.name + "\")", function (retVal) {
      var intVal = parseInt(retVal, 10);
      callback(intVal != 0);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.buttonon || sensorHandler.isElementRemoved(this.buttonon))
      this.buttonon = this.context.paper.image(getImg('buttonon.png'), imgx, imgy, imgw, imgh);

    if (!this.buttonoff || sensorHandler.isElementRemoved(this.buttonoff))
      this.buttonoff = this.context.paper.image(getImg('buttonoff.png'), imgx, imgy, imgw, imgh);

    if (this.state == null)
      this.state = false;

    this.buttonon.attr(sensorAttr);
    this.buttonoff.attr(sensorAttr);

    if (this.state) {
      this.buttonon.attr({"opacity": fadeopacity});
      this.buttonoff.attr({"opacity": 0});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
    } else {
      this.buttonon.attr({"opacity": 0});
      this.buttonoff.attr({"opacity": fadeopacity});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
    }

    if (!this.context.autoGrading && !this.buttonon.node.onmousedown) {
      this.focusrect.node.onmousedown = () => {
        if (this.context.offLineMode) {
          this.state = true;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.getSensorDrawer().drawSensor(this);
        } else
          sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      };


      this.focusrect.node.onmouseup = () => {
        if (this.context.offLineMode) {
          this.state = false;
          this.wasPressed = true;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.getSensorDrawer().drawSensor(this);

          if (this.onPressed)
            this.onPressed();
        } else
          sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      }

      this.focusrect.node.ontouchstart = this.focusrect.node.onmousedown;
      this.focusrect.node.ontouchend = this.focusrect.node.onmouseup;
    }
  }
}
