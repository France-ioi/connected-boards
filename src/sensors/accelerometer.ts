import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorAccelerometer extends AbstractSensor {
  protected type = 'accelerometer';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "accelerometer",
      suggestedName: strings.messages.sensorNameAccelerometer,
      description: strings.messages.accelerometerbmi160,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      step: 0.1,
      selectorImages: ["accel.png"],
      getStateString: function (state) {
        if (state == null)
          return "0m/s²";

        if (Array.isArray(state))
        {
          return "X: " + state[0] + "m/s² Y: " + state[1] + "m/s² Z: " + state[2] + "m/s²";
        }
        else {
          return state.toString() + "m/s²";
        }
      },
      getPercentageFromState: function (state) {
        var perc = ((state + 78.48) / 156.96)
        // console.log(state,perc)
        return perc;
      },
      getStateFromPercentage: function (percentage) {
        var value = ((percentage * 156.96) - 78.48);
        var state = parseFloat(value.toFixed(1));
        // console.log(state)
        return state;
      },
      cellsAmount: function(paper) {
        return 2;
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readAccelBMI160()", function(val) {
      var array = JSON.parse(val);
      callback(array);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1y, cx}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('accel.png'), imgx, imgy, imgw, imgh);

    // this.context.paper.rect(x,y,w,h)
    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    if (this.stateText)
      this.stateText.remove();

    if (!this.state) {
      this.state = [0, 0, 1];
    }

    if (this.state) {
      try {
        let str = "X: " + this.state[0] + " m/s²\nY: " + this.state[1] + " m/s²\nZ: " + this.state[2] + " m/s²";
        this.stateText = this.context.paper.text(cx, state1y, str);
      } catch (e) {
        let a = 1;
      }
      // let bbox = sensor.stateText.getBBox();
      // sensor.stateText.attr("y",cy - bbox.height/2);
    }

    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, -8 * 9.81, 8 * 9.81);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
