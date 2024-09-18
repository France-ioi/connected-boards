import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {buzzerSound} from "./util/buzzer_sound";
import {getImg} from "../util";

export class SensorBuzzer extends AbstractSensor<any> {
  private buzzeron: any;
  private buzzeroff: any;
  private muteBtn: any;
  private buzzerInterval: any;
  private ringingState: boolean;
  public type = 'buzzer';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "buzzer",
      suggestedName: strings.messages.sensorNameBuzzer,
      description: strings.messages.buzzer,
      isAnalog: false,
      isSensor: false,
      portType: "D",
      selectorImages: ["buzzer-ringing.png"],
      valueType: "boolean",
      getPercentageFromState: function (state, sensor) {

        if (sensor.showAsAnalog)
        {
          return (state - sensor.minAnalog) / (sensor.maxAnalog - sensor.minAnalog);
        } else {
          if (state)
            return 1;
          else
            return 0;
        }
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      getStateString: function(state) {

        if(typeof state == 'number' &&
          state != 1 &&
          state != 0) {

          return state.toString() + "Hz";
        }
        return state ? strings.messages.on.toUpperCase() : strings.messages.off.toUpperCase();
      },
      subTypes: [
        {
          subType: "active",
          description: strings.messages.grovebuzzer,
          pluggable: true,
        },
        {
          subType: "passive",
          description: strings.messages.quickpibuzzer,
        }
      ],
    };
  }

  getInitialState() {
    return false;
  }

  setLiveState(state, callback) {
    var ledstate = state ? 1 : 0;
    var command = "setBuzzerState(\"" + this.name + "\"," + ledstate + ")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (typeof this.state == 'number' &&
      this.state != 0 &&
      this.state != 1) {
      buzzerSound.start(this.name, this.state);
    } else if (this.state) {
      buzzerSound.start(this.name);
    } else {
      buzzerSound.stop(this.name);
    }

    if (!juststate) {
      if (this.muteBtn) {
        this.muteBtn.remove();
      }

      // let muteBtnSize = w * 0.15;
      let muteBtnSize = imgw * 0.3;
      this.muteBtn = this.context.paper.text(
        imgx + imgw * 0.8,
        imgy + imgh * 0.8,
        buzzerSound.isMuted(this.name) ? "\uf6a9" : "\uf028"
      );
      this.muteBtn.node.style.fontWeight = "bold";
      this.muteBtn.node.style.cursor = "default";
      this.muteBtn.node.style.MozUserSelect = "none";
      this.muteBtn.node.style.WebkitUserSelect = "none";
      this.muteBtn.attr({
        "font-size": muteBtnSize + "px",
        fill: buzzerSound.isMuted(this.name) ? "lightgray" : "#468DDF",
        "font-family": '"Font Awesome 5 Free"',
        'text-anchor': 'start',
        "cursor": "pointer"
      });
      let bbox = this.muteBtn.getBBox();

      this.muteBtn.click(() => {
        if (buzzerSound.isMuted(this.name)) {
          buzzerSound.unmute(this.name)
        } else {
          buzzerSound.mute(this.name)
        }
        sensorHandler.getSensorDrawer().drawSensor(this);
      });
      this.muteBtn.toFront();
    }


    if (!this.buzzeron || sensorHandler.isElementRemoved(this.buzzeron))
      this.buzzeron = this.context.paper.image(getImg('buzzer-ringing.png'), imgx, imgy, imgw, imgh);

    if (!this.buzzeroff || sensorHandler.isElementRemoved(this.buzzeroff)) {
      this.buzzeroff = this.context.paper.image(getImg('buzzer.png'), imgx, imgy, imgw, imgh);

      this.focusrect.click(() => {
        if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
          this.state = !this.state;
          sensorHandler.warnClientSensorStateChanged(this);
          sensorHandler.getSensorDrawer().drawSensor(this);
        } else {
          sensorHandler.actuatorsInRunningModeError();
        }
      });
    }

    if (this.state) {
      if (!this.buzzerInterval) {
        this.buzzerInterval = setInterval(() => {

          if (!this.removed) {
            this.ringingState = !this.ringingState;
            sensorHandler.getSensorDrawer().drawSensor(this, true, true);
          } else {
            clearInterval(this.buzzerInterval);
          }

        }, 100);
      }
    } else {
      if (this.buzzerInterval) {
        clearInterval(this.buzzerInterval);
        this.buzzerInterval = null;
        this.ringingState = null;
      }
    }
    this.buzzeron.attr(sensorAttr);
    this.buzzeroff.attr(sensorAttr);

    let drawState = this.state;
    if (this.ringingState != null)
      drawState = this.ringingState;

    if (drawState) {
      this.buzzeron.attr({"opacity": fadeopacity});
      this.buzzeroff.attr({"opacity": 0});
    } else {
      this.buzzeron.attr({"opacity": 0});
      this.buzzeroff.attr({"opacity": fadeopacity});
    }

    if (this.stateText)
      this.stateText.remove();

    let stateText = sensorHandler.findSensorDefinition(this).getStateString(this.state);

    this.stateText = this.context.paper.text(state1x, state1y, stateText);

    if ((!this.context.runner || !this.context.runner.isRunning()) && !this.context.offLineMode) {
        this.setLiveState(this.state, function () {
        });
    }
  }
}
