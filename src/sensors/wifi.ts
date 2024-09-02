import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg, textEllipsis} from "../util";

export class SensorWifi extends AbstractSensor {
  protected active: any;
  protected type = 'wifi';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "wifi",
      suggestedName: strings.messages.sensorNameWifi,
      description: strings.messages.wifi,
      isAnalog: false,
      isSensor: false,
      portType: "D",

      selectorImages: ["wifi.png"],
      valueType: "object",
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
        return `[${state.join(', ')}]`;
      },
    };
  }

  getInitialState() {
    return null;
  }

  setLiveState(state, callback) {
    var command = `setWifiState("${this.name}", [0, 0, 0])`;

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img)) {
      this.img = this.context.paper.image(getImg('wifi.png'), imgx, imgy, imgw, imgh);

      this.focusrect.click(() => {
        if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
          this.state.connected = !this.state.connected;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.getSensorDrawer().drawSensor(this);
        } else {
          sensorHandler.getSensorDrawer().actuatorsInRunningModeError();
        }
      });
    }

    if (!this.active || sensorHandler.isElementRemoved(this.active))
      this.active = this.context.paper.circle();

    const ssid = this.state?.ssid;
    this.stateText = this.context.paper.text(state1x, state1y, this.state?.scanning ? '...' : (ssid ? textEllipsis(ssid, 6) : ''));

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    let color = 'grey';
    if (this.state?.active) {
      if (this.state.connected) {
        color = 'green';
      } else {
        color = 'red';
      }
    }

    this.active.attr({
      "cx": imgx + imgw*0.15,
      "cy": imgy + imgh*0.1,
      "r": imgh*0.15,
      fill: `${color}`,
      stroke: 'none',
      opacity: 1,
    });
  }
}
