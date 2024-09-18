import {AbstractSensor} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";

export class SensorLedMatrix extends AbstractSensor<any> {
  private ledmatrix: any;
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
    var command = "setLedMatrixState(\"" + this.name + "\"," + JSON.stringify(state) + ")";

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
      "fill": "red",
      "stroke": "darkgray"
    };
    let ledmatrixOffAttr = {
      "fill": "lightgray",
      "stroke": "darkgray"
    };

    if (!this.ledmatrix || sensorHandler.isElementRemoved(this.ledmatrix[0][0])) {
      this.ledmatrix = [];
      for (let i = 0; i < 5; i++) {
        this.ledmatrix[i] = [];
        for (let j = 0; j < 5; j++) {
          this.ledmatrix[i][j] = this.context.paper.rect(imgx + (imgw / 5) * i, imgy + (imgh / 5) * j, imgw / 5, imgh / 5);
          this.ledmatrix[i][j].attr(ledmatrixOffAttr);
        }
      }
    }

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.state[i][j]) {
          this.ledmatrix[i][j].attr(ledmatrixOnAttr);
        } else {
          this.ledmatrix[i][j].attr(ledmatrixOffAttr);
        }
      }
    }

    const ledMatrixListener = (imgx, imgy, imgw, imgh, sensor) => {
      return (e) => {
        let i = Math.floor((e.offsetX - imgx) / (imgw / 5));
        let j = Math.floor((e.offsetY - imgy) / (imgh / 5));
        sensor.state[i][j] = !sensor.state[i][j] ? 1 : 0;
        sensor.setLiveState(sensor.state, () => {
        });
        sensorHandler.getSensorDrawer().drawSensor(sensor);
      }
    }

    this.focusrect.unclick();
    this.focusrect.click(ledMatrixListener(imgx, imgy, imgw, imgh, this));
  }
}
