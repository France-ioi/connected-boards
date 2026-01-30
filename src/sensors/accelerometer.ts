import {AbstractSensor, SensorDrawParameters, SensorDrawTimeLineParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";
import {type} from "jquery";

export class SensorAccelerometer extends AbstractSensor<any> {
  public type = 'accelerometer';
  public gestures: Record<string, any> = {};

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

        if (Array.isArray(state)) {
          return ['X', 'Y', 'Z'].map((dir, index) => `${dir}: ${parseFloat(this.state[index].toFixed(1))} m/s²`).join(" ");
        } else {
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
      const array = JSON.parse(val);
      callback(array);
    });
  }

  draw(sensorHandler: SensorHandler, sensorDrawParameters: SensorDrawParameters) {
    const {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1y} = sensorDrawParameters;

    if (this.stateText)
      this.stateText.remove();

    const hasGestures = !!this.context.infos?.enabledGestures?.length;

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('accel.png'), imgx, imgy, imgw, imgh);


    const dx = sensorDrawParameters.w * 0.04
    // this.context.paper.rect(x,y,w,h)
    this.img.attr({
      "x": hasGestures ? sensorDrawParameters.x + dx : imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": fadeopacity,
    });

    if (!this.state) {
      this.state = [0, 0, 1, null];
    }

    if (this.state) {
      const str = ['X', 'Y', 'Z'].map((dir, index) => `${dir}: ${parseFloat(this.state[index].toFixed(1))} m/s²`).join("\n");
      const textOffset = hasGestures ? sensorDrawParameters.x + sensorDrawParameters.imgw + sensorDrawParameters.w * 0.08 :  sensorDrawParameters.cx;
      this.stateText = this.context.paper.text(textOffset, state1y, str);
    }

    const canActOnSensor = (!this.context.autoGrading && this.context.offLineMode);

    if (hasGestures) {
      const buttonWidth = sensorDrawParameters.w * 0.2;
      const buttonHeight = sensorDrawParameters.h * 0.15;
      const buttonSpacing = sensorDrawParameters.h * 0.05;
      const totalButtonsH = buttonHeight * this.context.infos.enabledGestures.length + buttonSpacing * (this.context.infos.enabledGestures.length - 1);
      console.log({buttonHeight, totalButtonsH})
      const buttonsY = sensorDrawParameters.imgy + sensorDrawParameters.imgh / 2 - totalButtonsH / 2;
      for (let [index, gesture] of this.context.infos.enabledGestures.entries()) {
        const x = sensorDrawParameters.x + sensorDrawParameters.w - dx - buttonWidth;
        console.log({sensorDrawParameters, buttonWidth})
        const y = buttonsY + index * (buttonHeight + buttonSpacing);

        this.gestures[gesture] ||= {rect: null, text: null};
        if (!this.gestures[gesture].rect || sensorHandler.isElementRemoved(this.gestures[gesture].rect)) {
          this.gestures[gesture].rect = this.context.paper.rect(x, y, buttonWidth, buttonHeight);
          this.gestures[gesture].text = this.context.paper.text(x + buttonWidth / 2, y + buttonHeight / 2, gesture);

          for (let obj of Object.values(this.gestures[gesture])) {
            (obj as any).click(() => {
              console.log('gesture', gesture);

              if (this.context.offLineMode) {
                this.state[3] = this.state[3] === gesture ? null : gesture;
                sensorHandler.warnClientSensorStateChanged(this);
                sensorHandler.drawSensor(this);
              } else {
                sensorHandler.getSensorDrawer().sensorInConnectedModeError();
              }
            });
          }
        }

        this.gestures[gesture].rect.attr({
          r: 2,
          stroke: 'gray',
          fill: this.state[3] === gesture ? '#4a90e2' : 'white',
          cursor: canActOnSensor ? 'pointer' : 'default',
        });
        this.gestures[gesture].text.node.style.userSelect = "none";
        this.gestures[gesture].text.attr({
          "font-size": sensorDrawParameters.h * 0.1,
          'text-anchor': 'middle',
          'font-weight': 'normal',
          fill: this.state[3] === gesture ? 'white' : 'gray',
          cursor: canActOnSensor ? 'pointer' : 'default',
        });
      }

      this.focusrect.attr({
        "width": hasGestures ? sensorDrawParameters.w * 0.65 : sensorDrawParameters.w * 0.5,
        ...(hasGestures ? {x: sensorDrawParameters.x} : {}),
      });
    }

    if (canActOnSensor) {
      sensorHandler.getSensorDrawer().setSlider(this, juststate, imgx, imgy, imgw, imgh, -8 * 9.81, 8 * 9.81, 3);
    } else {
      this.focusrect.click(() => {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
      });

      sensorHandler.getSensorDrawer().removeSlider(this);
    }
  }

  drawTimelineState(sensorHandler: SensorHandler, state: any, expectedState: any, type: string, drawParameters: SensorDrawTimeLineParameters) {
    sensorHandler.getSensorDrawer().drawMultipleTimeLine(this, state, expectedState, type, drawParameters);
  }
}
