import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export class SensorTemperature extends AbstractSensor {
  private img2: any;
  private img3: any;
  public type = 'temperature';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "temperature",
      suggestedName: strings.messages.sensorNameTemperature,
      description: strings.messages.tempsensor,
      isAnalog: true,
      isSensor: true,
      portType: "A",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["temperature-hot.png", "temperature-overlay.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
      subTypes: [{
        subType: "groveanalog",
        description: strings.messages.groveanalogtempsensor,
        portType: "A",
        pluggable: true,
      },
        {
          subType: "BMI160",
          description: strings.messages.quickpigyrotempsensor,
          portType: "i2c",
        },
        {
          subType: "DHT11",
          description: strings.messages.dht11tempsensor,
          portType: "D",
          pluggable: true,
        }],
    };
  }

  getLiveState (callback) {
    this.context.quickPiConnection.sendCommand("readTemperature(\"" + this.name + "\")", function(val) {
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
      this.img = this.context.paper.image(getImg('temperature-cold.png'), imgx, imgy, imgw, imgh);

    if (!this.img2 || sensorHandler.isElementRemoved(this.img2))
      this.img2 = this.context.paper.image(getImg('temperature-hot.png'), imgx, imgy, imgw, imgh);

    if (!this.img3 || sensorHandler.isElementRemoved(this.img3))
      this.img3 = this.context.paper.image(getImg('temperature-overlay.png'), imgx, imgy, imgw, imgh);

    this.img.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,

    });
    this.img2.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    this.img3.attr({
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    let scale = imgh / 60;

    let cliph = scale * this.state;

    this.img2.attr({
      "clip-rect":
        imgx + "," +
        (imgy + imgh - cliph) + "," +
        (imgw) + "," +
        cliph
    });

    this.stateText = this.context.paper.text(state1x, state1y, this.state + " °C");

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
