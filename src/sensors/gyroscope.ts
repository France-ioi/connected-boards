import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";
import {gyroscope3D} from "./util/gyroscope3d";

export class SensorGyroscope extends AbstractSensor {
  private canvas: any;
  private canvasNode: any;
  private screenrect: any;
  private rotationAngles: number[];
  private previousState: number[];
  private old_state: number[];
  private lastSpeedChange: Date;
  protected type = 'gyroscope';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "gyroscope",
      suggestedName: strings.messages.sensorNameGyroscope,
      description: strings.messages.gyrobmi160,
      isAnalog: true,
      isSensor: true,
      portType: "i2c",
      valueType: "object",
      valueMin: 0,
      valueMax: 100,
      selectorImages: ["gyro.png"],
      getPercentageFromState: function (state) {
        return (state + 125) / 250;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 250) - 125;
      },
      cellsAmount: function(paper) {
        return 2;
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("readGyroBMI160()", (val) => {
      let array = JSON.parse(val);
      array[0] = Math.round(array[0]);
      array[1] = Math.round(array[1]);
      array[2] = Math.round(array[2]);
      callback(array);
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, cx, state1y, sensorAttr}: SensorDrawParameters) {
    if (!this.state) {
      this.state = [0, 0, 0];
    }
    if (this.stateText) {
      this.stateText.remove();
    }

    let str = "X: " + this.state[0] + "°/s\nY: " + this.state[1] + "°/s\nZ: " + this.state[2] + "°/s";
    this.stateText = this.context.paper.text(cx, state1y, str);
    if (!this.previousState)
      this.previousState = [0, 0, 0];

    if (this.rotationAngles != undefined) {

      // update the rotation angle
      for (let i = 0; i < 3; i++)
        this.rotationAngles[i] += this.previousState[i] * ((+new Date() - +this.lastSpeedChange) / 1000);

      this.lastSpeedChange = new Date();
    }


    this.previousState = this.state;

    let img3d = null;
    if (!this.context.autoGrading && this.context.offLineMode) {
      img3d = gyroscope3D.getInstance(imgw, imgh);
    }
    if (img3d) {
      if (!this.screenrect || sensorHandler.isElementRemoved(this.screenrect)) {
        this.screenrect = this.context.paper.rect(imgx, imgy, imgw, imgh);
        this.screenrect.attr({"opacity": 0});

        this.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        this.canvasNode.setAttribute("x", imgx);
        this.canvasNode.setAttribute("y", imgy);
        this.canvasNode.setAttribute("width", imgw);
        this.canvasNode.setAttribute("height", imgh);
        this.context.paper.canvas.appendChild(this.canvasNode);

        this.canvas = document.createElement("canvas");
        this.canvas.width = imgw;
        this.canvas.height = imgh;
        this.canvasNode.appendChild(this.canvas);
      }

      let sensorCtx = this.canvas.getContext('2d');
      sensorCtx.clearRect(0, 0, imgw, imgh);

      sensorCtx.drawImage(img3d.render(
        this.state[0],
        this.state[2],
        this.state[1]
      ), 0, 0);

      if (!juststate) {
        this.focusrect.drag(
          (dx, dy, x, y, event) => {
            this.state[0] = Math.max(-125, Math.min(125, this.old_state[0] + dy));
            this.state[1] = Math.max(-125, Math.min(125, this.old_state[1] - dx));
            sensorHandler.warnClientSensorStateChanged(this);
            sensorHandler.getSensorDrawer().drawSensor(this, true)
          },
          () => {
            this.old_state = this.state.slice();
          }
        );
      }

    } else {
      if (!this.img || sensorHandler.isElementRemoved(this.img)) {
        this.img = this.context.paper.image(getImg('gyro.png'), imgx, imgy, imgw, imgh);
      }
      this.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });
      if (!this.context.autoGrading && this.context.offLineMode) {
        sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, -125, 125);
      } else {
        this.focusrect.click(() => {
          sensorHandler.getSensorDrawer().sensorInConnectedModeError();
        });

        sensorHandler.getSensorDrawer().removeSlider(this);
      }
    }
  }
}
