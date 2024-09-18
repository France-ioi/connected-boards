import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";

export function generateIrRemoteDialog(strings: any) {
  return "<div class=\"content qpi\">" +
    "   <div class=\"panel-heading\">" +
    "       <h2 class=\"sectionTitle\">" +
    "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
    strings.messages.irRemoteControl +
    "       </h2>" +
    "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
    "   </div>" +
    "   <div id=\"sensorPicker\" class=\"panel-body\">" +
    "       <div id=\"piremotemessage\" >" +
    "       </div>" +
    "       <div id=\"piremotecontent\" >" +
    "       </div>" +
    "   </div>" +
    "   <div class=\"singleButton\">" +
    "       <button id=\"picancel2\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + strings.messages.closeDialog + "</button>" +
    "   </div>" +
    "</div>";
}

export class SensorIrTrans extends AbstractSensor<any> {
  private ledon: any;
  private ledoff: any;
  public type = 'irtrans';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "irtrans",
      suggestedName: strings.messages.sensorNameIrTrans,
      description: strings.messages.irtrans,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["irtranson.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
    };
  }

  setLiveState(state, callback) {
    var ledstate = state ? 1 : 0;
    var command = "setInfraredState(\"" + this.name + "\"," + ledstate + ")";

    this.context.quickPiConnection.sendCommand(command, callback);
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.ledon || sensorHandler.isElementRemoved(this.ledon)) {
      this.ledon = this.context.paper.image(getImg("irtranson.png"), imgx, imgy, imgw, imgh);
    }

    const irRemoteDialog = generateIrRemoteDialog(this.strings);

    if (!this.ledoff || sensorHandler.isElementRemoved(this.ledoff)) {
      this.ledoff = this.context.paper.image(getImg('irtransoff.png'), imgx, imgy, imgw, imgh);

      this.focusrect.click(() => {
        if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())
          && !this.context.offLineMode) {
          //sensor.state = !sensor.state;
          //this.drawSensor(sensor);
          window.displayHelper.showPopupDialog(irRemoteDialog, () => {
            $('#picancel').click(() => {
              $('#popupMessage').hide();
              window.displayHelper.popupMessageShown = false;
            });

            $('#picancel2').click(() => {
              $('#popupMessage').hide();
              window.displayHelper.popupMessageShown = false;
            });

            let addedSomeButtons = false;
            let remotecontent = document.getElementById('piremotecontent');
            let parentdiv = document.createElement("DIV");
            parentdiv.className = "form-group";

            remotecontent.appendChild(parentdiv);
            let count = 0;
            for (let code in this.context.remoteIRcodes) {
              addedSomeButtons = true;
              this.context.remoteIRcodes[code];

              let btn = document.createElement("BUTTON");
              let t = document.createTextNode(code);

              btn.className = "btn";
              btn.appendChild(t);
              parentdiv.appendChild(btn);

              let capturedcode = code;
              let captureddata = this.context.remoteIRcodes[code];
              btn.onclick = () => {
                $('#popupMessage').hide();
                window.displayHelper.popupMessageShown = false;

                //if (sensor.waitingForIrMessage)
                //sensor.waitingForIrMessage(capturedcode);

                this.context.quickPiConnection.sendCommand("presetIRMessage(\"" + capturedcode + "\", '" + captureddata + "')", function (returnVal) {
                });
                this.context.quickPiConnection.sendCommand("sendIRMessage(\"irtran1\", \"" + capturedcode + "\")", function (returnVal) {
                });

              };

              count += 1;

              if (count == 4) {
                count = 0;
                parentdiv = document.createElement("DIV");
                parentdiv.className = "form-group";
                remotecontent.appendChild(parentdiv);
              }
            }
            if (!addedSomeButtons) {
              $('#piremotemessage').text(this.strings.messages.noIrPresets);
            }

            let btn = document.createElement("BUTTON");
            let t = document.createTextNode(this.strings.messages.irEnableContinous);
            if (this.state) {
              t = document.createTextNode(this.strings.messages.irDisableContinous);
            }

            btn.className = "btn";
            btn.appendChild(t);
            parentdiv.appendChild(btn);
            btn.onclick = () => {
              $('#popupMessage').hide();
              window.displayHelper.popupMessageShown = false;

              this.state = !this.state;
              sensorHandler.warnClientSensorStateChanged(this);
              sensorHandler.getSensorDrawer().drawSensor(this);
            };
          });
        } else {
          sensorHandler.actuatorsInRunningModeError();
        }
      });
    }

    this.ledon.attr(sensorAttr);
    this.ledoff.attr(sensorAttr);

    if (this.state) {
      this.ledon.attr({"opacity": fadeopacity});
      this.ledoff.attr({"opacity": 0});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
    } else {
      this.ledon.attr({"opacity": 0});
      this.ledoff.attr({"opacity": fadeopacity});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
    }

    if ((!this.context.runner || !this.context.runner.isRunning())
      && !this.context.offLineMode) {
      this.setLiveState(this.state, function () {
      });
    }
  }
}
