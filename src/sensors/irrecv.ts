import {AbstractSensor, SensorDrawParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";
import {generateIrRemoteDialog} from "./irtrans";

export class SensorIrRecv extends AbstractSensor<any> {
  private buttonon: any;
  private buttonoff: any;
  private waitingForIrMessage: (code: string) => void;
  public type = 'irrecv';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "irrecv",
      suggestedName: strings.messages.sensorNameIrRecv,
      description: strings.messages.irreceiver,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "number",
      valueMin: 0,
      valueMax: 60,
      selectorImages: ["irrecvon.png"],
      getPercentageFromState: function (state) {
        return state / 60;
      },
      getStateFromPercentage: function (percentage) {
        return Math.round(percentage * 60);
      },
    };
  }

  getLiveState(callback) {
    this.context.quickPiConnection.sendCommand("isButtonPressed(\"" + this.name + "\")", function (retVal) {
      if ('boolean' === typeof retVal) {
        callback(retVal);
      } else {
        const intVal = parseInt(retVal, 10);
        callback(intVal == 0);
      }
    });
  }

  draw(sensorHandler: SensorHandler, {imgx, imgy, imgw, imgh, juststate, fadeopacity, state1x, state1y, sensorAttr}: SensorDrawParameters) {
    if (this.stateText)
      this.stateText.remove();

    if (!this.buttonon || sensorHandler.isElementRemoved(this.buttonon))
      this.buttonon = this.context.paper.image(getImg('irrecvon.png'), imgx, imgy, imgw, imgh);

    if (!this.buttonoff || sensorHandler.isElementRemoved(this.buttonoff))
      this.buttonoff = this.context.paper.image(getImg('irrecvoff.png'), imgx, imgy, imgw, imgh);

    this.buttonon.attr(sensorAttr);
    this.buttonoff.attr(sensorAttr);

    if (this.state) {
      this.buttonon.attr({"opacity": fadeopacity});
      this.buttonoff.attr({"opacity": 0});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
    } else {
      this.buttonon.attr({"opacity": 0});
      this.buttonoff.attr({"opacity": fadeopacity});

      this.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
    }

    const irRemoteDialog = generateIrRemoteDialog(this.strings);

    this.focusrect.click(() => {
      if (this.context.offLineMode) {
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
            btn.onclick = () => {
              $('#popupMessage').hide();
              window.displayHelper.popupMessageShown = false;

              if (this.waitingForIrMessage)
                this.waitingForIrMessage(capturedcode);
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
        //this.sensorInConnectedModeError();

        this.context.stopLiveUpdate = true;

        let irLearnDialog = "<div class=\"content qpi\">" +
          "   <div class=\"panel-heading\">" +
          "       <h2 class=\"sectionTitle\">" +
          "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
          this.strings.messages.irReceiverTitle +
          "       </h2>" +
          "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
          "   </div>" +
          "   <div id=\"sensorPicker\" class=\"panel-body\">" +
          "       <div class=\"form-group\">" +
          "           <p>" + this.strings.messages.directIrControl + "</p>" +
          "       </div>" +
          "       <div class=\"form-group\">" +
          "           <p id=piircode></p>" +
          "       </div>" +
          "   </div>" +
          "   <div class=\"singleButton\">" +
          "       <button id=\"piirlearn\" class=\"btn\"><i class=\"fa fa-wifi icon\"></i>" + this.strings.messages.getIrCode + "</button>" +
          "       <button id=\"picancel2\" class=\"btn\"><i class=\"fa fa-times icon\"></i>" + this.strings.messages.closeDialog + "</button>" +
          "   </div>" +
          "</div>";

        window.displayHelper.showPopupDialog(irLearnDialog, () => {
          $('#picancel').click(() => {
            $('#popupMessage').hide();
            window.displayHelper.popupMessageShown = false;
            this.context.stopLiveUpdate = false;
          });

          $('#picancel2').click(() => {
            $('#popupMessage').hide();
            window.displayHelper.popupMessageShown = false;
            this.context.stopLiveUpdate = false;
          });

          $('#piirlearn').click(() => {

            $('#piirlearn').attr('disabled', 'disabled');

            $("#piircode").text("");
            this.context.quickPiConnection.sendCommand("readIRMessageCode(\"irrec1\", 10000)", function (retval) {
              $('#piirlearn').attr('disabled', null);
              $("#piircode").text(retval);
            });
          });
        });
      }
    });
    /*
    if (!this.context.autoGrading && !sensor.buttonon.node.onmousedown) {
        sensor.focusrect.node.onmousedown = () => {
            if (this.context.offLineMode) {
                sensor.state = true;
                this.drawSensor(sensor);
            } else
                this.sensorInConnectedModeError();
        };


        sensor.focusrect.node.onmouseup = () => {
            if (this.context.offLineMode) {
                sensor.state = false;
                this.drawSensor(sensor);

                if (sensor.onPressed)
                    sensor.onPressed();
            } else
                this.sensorInConnectedModeError();
        }

        sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
        sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
    }*/
  }
}
