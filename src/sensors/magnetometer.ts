import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorMagnetometer extends AbstractSensor {
  private needle: any;
  public type = 'magnetometer';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "magnetometer",
      suggestedName: strings.messages.sensorNameMagnetometer,
      description: strings.messages.maglsm303c,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["mag.png"],
      getPercentageFromState: function (state) {
        return (state + 1600) / 3200;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 3200) - 1600;
      },
      cellsAmount: function(paper) {
        return 2;
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readMagnetometerLSM303C(False)", (val) => {
      var array = JSON.parse(val);

      array[0] = Math.round(array[0]);
      array[1] = Math.round(array[1]);
      array[2] = Math.round(array[2]);

      callback(array);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, cx, state1y}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('mag.png'), imgx, imgy, imgw, imgh);

    if (!this.needle || sensorHandler.isElementRemoved(this.needle))
      this.needle = this.context.paper.image(getImg('mag-needle.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    this.needle.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "transform": "",
      "opacity": fadeopacity,
    });

    if (!this.state) {
      this.state = [0, 0, 0];
    }

    if (this.state) {
      let heading = Math.atan2(this.state[0], this.state[1]) * (180 / Math.PI) + 180;

      this.needle.rotate(heading);
    }

    if (this.stateText)
      this.stateText.remove();

    if (this.state) {
      let str = "X: " + this.state[0] + " μT\nY: " + this.state[1] + " μT\nZ: " + this.state[2] + " μT";
      this.stateText = this.context.paper.text(cx, state1y, str);
    }

    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, -1600, 1600);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
