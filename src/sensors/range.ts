import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorRange extends AbstractSensor<any> {
  private rangedistance: any;
  private rangedistancestart: any;
  private rangedistanceend: any;
  public type = 'range';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "range",
      suggestedName: strings.messages.sensorNameDistance,
      description: strings.messages.distancesensor,
      isAnalog: true,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 5000,
      selectorImages: ["range.png"],
      getPercentageFromState: function (state) {
        return state / 500;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 500);
      },
      disablePinControl: true,
      subTypes: [{
        subType: "vl53l0x",
        description: strings.messages.timeofflightranger,
        portType: "i2c",
      },
        {
          subType: "ultrasonic",
          description: strings.messages.ultrasonicranger,
          portType: "D",
          pluggable: true,
        }],
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readDistance(\"" + this.name + "\")", function(val) {
      val = Math.round(val);
      callback(val);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('range.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy - imgh * 0.1,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    if (this.state == null)
      this.state = 500;

    if (this.rangedistance)
      this.rangedistance.remove();

    if (this.rangedistancestart)
      this.rangedistancestart.remove();

    if (this.rangedistanceend)
      this.rangedistanceend.remove();

    let rangew;

    if (this.state < 30) {
      rangew = imgw * this.state / 100;
    } else {
      let firstpart = imgw * 30 / 100;
      let remaining = imgw - firstpart;

      rangew = firstpart + (remaining * (this.state) * 0.0015);
    }

    let cx = imgx + (imgw / 2);
    let cy = imgy + imgh * 0.85;
    let x1 = cx - rangew / 2;
    let x2 = cx + rangew / 2;
    let markh = 12;
    let y1 = cy - markh / 2;
    let y2 = cy + markh / 2;

    this.rangedistance = this.context.paper.path(["M", x1, cy, "H", x2]);
    this.rangedistancestart = this.context.paper.path(["M", x1, y1, "V", y2]);
    this.rangedistanceend = this.context.paper.path(["M", x2, y1, "V", y2]);

    this.rangedistance.attr({
      "stroke-width": 4,
      "stroke": "#468DDF",
      "stroke-linecapstring": "round"
    });

    this.rangedistancestart.attr({
      "stroke-width": 4,
      "stroke": "#468DDF",
      "stroke-linecapstring": "round"
    });

    this.rangedistanceend.attr({
      "stroke-width": 4,
      "stroke": "#468DDF",
      "stroke-linecapstring": "round"
    });

    if (this.state >= 10)
      this.state = Math.round(this.state);

    this.stateText = this.context.paper.text(state1x, state1y, this.state + " cm");
    if (!this.context.autoGrading && this.context.offLineMode) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, 0, 500);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }
}
