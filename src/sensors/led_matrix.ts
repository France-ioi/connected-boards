import {AbstractSensor} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";

export class SensorLedMatrix extends AbstractSensor<any> {
  private ledmatrixOff: any;
  private ledmatrixOn: any;
  private paper: any;
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
      getPercentageFromState: function (state) {
        if (state) {
          var total = 0;
          state.forEach(function(substate) {
            substate.forEach(function(v) {
              total += v;
            });
          });
          return total / 25;
        }
        return 0;
      },
      getStateFromPercentage: function (percentage) {
        if(percentage > 0) {
          return [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]];
        }
        return [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
      },
      getStateString: function(state) {
        return '';
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

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh}) {
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

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        this.ledmatrixOn[y][x].attr({
          opacity: this.state[y][x] / 10,
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
}
