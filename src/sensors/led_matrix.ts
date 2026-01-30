import {AbstractSensor, SensorDrawTimeLineParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {drawBubbleTimeline} from "./util/bubble_timeline";

type SensorLedMatrixState = number[][];

export class SensorLedMatrix extends AbstractSensor<SensorLedMatrixState> {
  private ledmatrixOff: any;
  private ledmatrixOn: any;
  public type = 'ledmatrix';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "ledmatrix",
      suggestedName: strings.messages.sensorNameLedMatrix,
      description: strings.messages.ledmatrix,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      selectorImages: ["ledon-red.png"],
      valueType: "boolean",
      pluggable: true,
      getStateString: function(state) {
        return '';
      },
      getWrongStateString: function(failInfo) {
        if(!failInfo.expected ||
          !failInfo.actual) {
          return null; // Use default message
        }

        let nbDiff = 0;
        for (let y = 0; y < 5; y++) {
          for (let x = 0; x < 5; x++) {
            if (failInfo.expected[y][x] !== failInfo.actual[y][x]) {
              nbDiff++;
            }
          }
        }

        return strings.messages.wrongStateDrawing.format(failInfo.name, nbDiff, failInfo.time);
      },
    };
  }

  setLiveState(state, callback) {
    const stateString = state.map(a => a.join('')).join(':');
    const command = `ledMatrixShowImage("${this.name}", Image("${stateString}"))`;
    this.context.quickPiConnection.sendCommand(command, callback);
  }

  getInitialState() {
    return [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, h}) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.state || !this.state.length)
      this.state = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

    let ledmatrixOnAttr = {
      fill: 'red',
      stroke: 'transparent',
      opacity: 0,
    };

    let ledmatrixOffAttr = {
      fill: 'lightgray',
      stroke: 'darkgray',
    };

    if (!this.ledmatrixOff || sensorHandler.isElementRemoved(this.ledmatrixOff[0][0])) {
      this.ledmatrixOff = [];
      this.ledmatrixOn = [];
      for (let y = 0; y < 5; y++) {
        this.ledmatrixOff[y] = [];
        this.ledmatrixOn[y] = [];
        for (let x = 0; x < 5; x++) {
          this.ledmatrixOff[y][x] = this.context.paper.rect(imgx + (imgw / 5) * x, imgy + (imgh / 5) * y, imgw / 5, imgh / 5);
          this.ledmatrixOff[y][x].attr(ledmatrixOffAttr);

          this.ledmatrixOn[y][x] = this.context.paper.rect(imgx + (imgw / 5) * x, imgy + (imgh / 5) * y, imgw / 5, imgh / 5);
          this.ledmatrixOn[y][x].attr(ledmatrixOnAttr);
        }
      }
    }

    const offsetY = h * 0.08;
    const squareSize = (imgh - offsetY) / 5;

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        this.ledmatrixOn[y][x].attr({
          opacity: this.state[y][x] / 10,
          x: imgx + squareSize * x,
          y: imgy + offsetY + squareSize * y,
          width: imgw / 5,
          height: imgh / 5,
        });

        this.ledmatrixOff[y][x].attr({
          x: imgx + squareSize * x,
          y: imgy + offsetY + squareSize * y,
          width: imgw / 5,
          height: imgh / 5,
        });
      }
    }

    const ledMatrixListener = (imgx, imgy, imgw, imgh, sensor) => {
      return (e) => {
        if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
          let x = Math.floor((e.offsetX - imgx) / (imgw / 5));
          let y = Math.floor((e.offsetY - imgy) / (imgh / 5));
          sensor.state[y][x] = (sensor.state[y][x] + 1) % 10;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.drawSensor(this);

          if ((!this.context.runner || !this.context.runner.isRunning()) && !this.context.offLineMode) {
            this.setLiveState(this.state, function () {});
          }
        } else {
          sensorHandler.actuatorsInRunningModeError();
        }
      }
    }

    this.focusrect.unclick();
    this.focusrect.click(ledMatrixListener(imgx, imgy, imgw, imgh, this));

    if ((!this.context.runner || !this.context.runner.isRunning()) && !this.context.offLineMode) {
      this.setLiveState(this.state, function() {});
    }
  }

  drawTimelineState(sensorHandler: SensorHandler, state: SensorLedMatrixState, expectedState: SensorLedMatrixState, type: string, drawParameters: SensorDrawTimeLineParameters) {
    const drawBubble = () => {
      const table = `<table>
        ${state.map((line, y) => 
          `<tr>
            ${line.map((cell, x) =>
              `<td style="width: 20px; height: 20px; position: relative; background: lightgrey; border: solid 1px darkgrey">
                <div style="top: 0; left: 0; right: 0; bottom: 0; position: absolute; background: red; opacity: ${state[y][x]/10}"></div>
              </td>`
            ).join('')}
          </tr>`,
        ).join('')}
        </table>`;

      const div = document.createElement("div");
      $(div).html(table);

      return div;
    }

    drawBubbleTimeline<SensorLedMatrixState>(this, sensorHandler, state, expectedState, type, drawParameters, drawBubble);
  }
}
