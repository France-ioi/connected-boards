import {AbstractSensor, SensorDrawParameters, SensorDrawTimeLineParameters} from "./abstract_sensor";
import {QuickalgoLibrary, SensorDefinition} from "../definitions";
import {SensorHandler} from "./util/sensor_handler";
import {getImg} from "../util";
import {type} from "jquery";

const gpios = [10, 9, 11, 8, 7];

export class SensorStick extends AbstractSensor<any> {
  private imgup: any;
  private imgdown: any;
  private imgleft: any;
  private imgright: any;
  private imgcenter: any;
  private stateArrow: any;
  declare public portText?: any;
  public type = 'stick';

  static getDefinition(context: QuickalgoLibrary, strings: any): SensorDefinition {
    return {
      name: "stick",
      suggestedName: strings.messages.sensorNameStick,
      description: strings.messages.fivewaybutton,
      isAnalog: false,
      isSensor: true,
      portType: "D",
      valueType: "boolean",
      selectorImages: ["stick.png"],
      gpiosNames: ["up", "down", "left", "right", "center"],
      gpios,
      getPercentageFromState: function (state) {
        if (state)
          return 1;
        else
          return 0;
      },
      getStateFromPercentage: function (percentage) {
        if (percentage)
          return 1;
        else
          return 0;
      },
      compareState: function (state1, state2) {
        if (state1 == null && state2 == null)
          return true;

        return state1[0] == state2[0] &&
          state1[1] == state2[1] &&
          state1[2] == state2[2] &&
          state1[3] == state2[3] &&
          state1[4] == state2[4];
      },
      getButtonState: function(buttonname, state) {
        if (state) {
          var buttonparts = buttonname.split(".");
          var actualbuttonmame = buttonname;
          if (buttonparts.length == 2) {
            actualbuttonmame = buttonparts[1];
          }

          var index = this.gpiosNames.indexOf(actualbuttonmame);

          if (index >= 0) {
            return state[index];
          }
        }

        return false;
      },
      cellsAmount: function(paper) {
        return 2;
      },
    };
  }

  getLiveState(callback) {
    let cmd = "readStick(" + gpios.join() + ")";

    this.context.quickPiConnection.sendCommand("readStick(" + gpios.join() + ")", function (retVal) {
      let array = JSON.parse(retVal);
      callback(array);
    });
  }

  draw(sensorHandler: SensorHandler, drawParameters: SensorDrawParameters) {
    const  {imgx, imgy, imgw, imgh, fadeopacity, state1x, state1y} = drawParameters;

    if (this.stateText)
      this.stateText.remove();

    if (!this.img || sensorHandler.isElementRemoved(this.img))
      this.img = this.context.paper.image(getImg('stick.png'), imgx, imgy, imgw, imgh);

    if (!this.imgup || sensorHandler.isElementRemoved(this.imgup))
      this.imgup = this.context.paper.image(getImg('stickup.png'), imgx, imgy, imgw, imgh);

    if (!this.imgdown || sensorHandler.isElementRemoved(this.imgdown))
      this.imgdown = this.context.paper.image(getImg('stickdown.png'), imgx, imgy, imgw, imgh);

    if (!this.imgleft || sensorHandler.isElementRemoved(this.imgleft))
      this.imgleft = this.context.paper.image(getImg('stickleft.png'), imgx, imgy, imgw, imgh);

    if (!this.imgright || sensorHandler.isElementRemoved(this.imgright))
      this.imgright = this.context.paper.image(getImg('stickright.png'), imgx, imgy, imgw, imgh);

    if (!this.imgcenter || sensorHandler.isElementRemoved(this.imgcenter))
      this.imgcenter = this.context.paper.image(getImg('stickcenter.png'), imgx, imgy, imgw, imgh);

    let a = {
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
      "opacity": 0,
    };
    this.img.attr(a).attr("opacity", fadeopacity);

    this.imgup.attr(a);
    this.imgdown.attr(a);
    this.imgleft.attr(a);
    this.imgright.attr(a);
    this.imgcenter.attr(a);

    if (this.stateText)
      this.stateText.remove();

    if (!this.state)
      this.state = [false, false, false, false, false];

    // let stateString = "\n";
    let stateString = "";
    let click = false;
    if (this.state[0]) {
      stateString += this.strings.messages.up.toUpperCase() + "\n";
      this.imgup.attr({"opacity": 1});
      click = true;
    }
    if (this.state[1]) {
      stateString += this.strings.messages.down.toUpperCase() + "\n";
      this.imgdown.attr({"opacity": 1});
      click = true;
    }
    if (this.state[2]) {
      stateString += this.strings.messages.left.toUpperCase() + "\n";
      this.imgleft.attr({"opacity": 1});
      click = true;
    }
    if (this.state[3]) {
      stateString += this.strings.messages.right.toUpperCase() + "\n";
      this.imgright.attr({"opacity": 1});
      click = true;
    }
    if (this.state[4]) {
      stateString += this.strings.messages.center.toUpperCase() + "\n";
      this.imgcenter.attr({"opacity": 1});
      click = true;
    }
    if (!click) {
      stateString += "...";
    }

    this.stateText = this.context.paper.text(state1x, state1y, stateString);

    if (this.portText)
      this.portText.remove();

    drawParameters.drawPortText = false;

    if (this.portText)
      this.portText.remove();

    if (!this.context.autoGrading) {
      let gpios = sensorHandler.findSensorDefinition(this).gpios;
      let min = 255;
      let max = 0;

      for (let i = 0; i < gpios.length; i++) {
        if (gpios[i] > max)
          max = gpios[i];

        if (gpios[i] < min)
          min = gpios[i];
      }


      $('#stickupstate').text(this.state[0] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
      $('#stickdownstate').text(this.state[1] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
      $('#stickleftstate').text(this.state[2] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
      $('#stickrightstate').text(this.state[3] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
      $('#stickcenterstate').text(this.state[4] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());

      /*
                      sensor.portText = this.context.paper.text(state1x, state1y, "D" + min.toString() + "-D" + max.toString() + "?");
                      sensor.portText.attr({ "font-size": portsize + "px", 'text-anchor': 'start', fill: "blue" });
                      sensor.portText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
                      let b = sensor.portText._getBBox();
                      sensor.portText.translate(0, b.height / 2);

                      let stickPortsDialog = `
                      <div class="content qpi">
                      <div class="panel-heading">
                          <h2 class="sectionTitle">
                              <span class="iconTag"><i class="icon fas fa-list-ul"></i></span>
                              Noms et ports de la manette
                          </h2>
                          <div class="exit" id="picancel"><i class="icon fas fa-times"></i></div>
                      </div>
                      <div id="sensorPicker" class="panel-body">
                          <label></label>
                          <div class="flex-container">
                          <table style="display:table-header-group;">
                          <tr>
                          <th>Name</th>
                          <th>Port</th>
                          <th>State</th>
                          <th>Direction</th>
                          </tr>
                          <tr>
                          <td><label id="stickupname"></td><td><label id="stickupport"></td><td><label id="stickupstate"></td><td><label id="stickupdirection"><i class="fas fa-arrow-up"></i></td>
                          </tr>
                          <tr>
                          <td><label id="stickdownname"></td><td><label id="stickdownport"></td><td><label id="stickdownstate"></td><td><label id="stickdowndirection"><i class="fas fa-arrow-down"></i></td>
                          </tr>
                          <tr>
                          <td><label id="stickleftname"></td><td><label id="stickleftport"></td><td><label id="stickleftstate"></td><td><label id="stickleftdirection"><i class="fas fa-arrow-left"></i></td>
                          </tr>
                          <tr>
                          <td><label id="stickrightname"></td><td><label id="stickrightport"></td><td><label id="stickrightstate"></td><td><label id="stickrightdirection"><i class="fas fa-arrow-right"></i></td>
                          </tr>
                          <tr>
                          <td><label id="stickcentername"></td><td><label id="stickcenterport"></td><td><label id="stickcenterstate"></td><td><label id="stickcenterdirection"><i class="fas fa-circle"></i></td>
                          </tr>
                          </table>
                          </div>
                      </div>
                      <div class="singleButton">
                          <button id="picancel2" class="btn btn-centered"><i class="icon fa fa-check"></i>Fermer</button>
                      </div>
                  </div>
                      `;

                      sensor.portText.click(() => {
                          window.displayHelper.showPopupDialog(stickPortsDialog);

                          $('#picancel').click(() => {
                              $('#popupMessage').hide();
                              window.displayHelper.popupMessageShown = false;
                          });

                          $('#picancel2').click(() => {
                              $('#popupMessage').hide();
                              window.displayHelper.popupMessageShown = false;
                          });

                          $('#stickupname').text(sensor.name + ".up");
                          $('#stickdownname').text(sensor.name + ".down");
                          $('#stickleftname').text(sensor.name + ".left");
                          $('#stickrightname').text(sensor.name + ".right");
                          $('#stickcentername').text(sensor.name + ".center");

                          $('#stickupport').text("D" + gpios[0]);
                          $('#stickdownport').text("D" + gpios[1]);
                          $('#stickleftport').text("D" + gpios[2]);
                          $('#stickrightport').text("D" + gpios[3]);
                          $('#stickcenterport').text("D" + gpios[4]);

                          $('#stickupstate').text(sensor.state[0] ? "ON" : "OFF");
                          $('#stickdownstate').text(sensor.state[1] ? "ON" : "OFF");
                          $('#stickleftstate').text(sensor.state[2] ? "ON" : "OFF");
                          $('#stickrightstate').text(sensor.state[3] ? "ON" : "OFF");
                          $('#stickcenterstate').text(sensor.state[4] ? "ON" : "OFF");

                      });
                      */
    }


    function poinInRect(rect, x, y) {

      if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom)
        return true;

      return false;
    }

    function moveRect(rect, x, y) {
      rect.left += x;
      rect.right += x;

      rect.top += y;
      rect.bottom += y;
    }

    this.focusrect.node.onmousedown = (evt) => {
      if (!this.context.offLineMode) {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
        return;
      }

      let e = evt.target;
      let dim = e.getBoundingClientRect();
      let rectsize = dim.width * .30;


      let rect = {
        left: dim.left,
        right: dim.left + rectsize,
        top: dim.top,
        bottom: dim.top + rectsize,
      }

      // Up left
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[0] = true;
        this.state[2] = true;
      }

      // Up
      moveRect(rect, rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[0] = true;
      }

      // Up right
      moveRect(rect, rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[0] = true;
        this.state[3] = true;
      }

      // Right
      moveRect(rect, 0, rectsize);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[3] = true;
      }

      // Center
      moveRect(rect, -rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[4] = true;
      }

      // Left
      moveRect(rect, -rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[2] = true;
      }

      // Down left
      moveRect(rect, 0, rectsize);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[1] = true;
        this.state[2] = true;
      }

      // Down
      moveRect(rect, rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[1] = true;
      }

      // Down right
      moveRect(rect, rectsize, 0);
      if (poinInRect(rect, evt.clientX, evt.clientY)) {
        this.state[1] = true;
        this.state[3] = true;
      }

      sensorHandler.warnClientSensorStateChanged(this);
      sensorHandler.getSensorDrawer().drawSensor(this);
    }

    this.focusrect.node.onmouseup = (evt) => {
      if (!this.context.offLineMode) {
        sensorHandler.getSensorDrawer().sensorInConnectedModeError();
        return;
      }

      this.state = [false, false, false, false, false];
      sensorHandler.warnClientSensorStateChanged(this);
      sensorHandler.getSensorDrawer().drawSensor(this);
    }

    this.focusrect.node.ontouchstart = this.focusrect.node.onmousedown;
    this.focusrect.node.ontouchend = this.focusrect.node.onmouseup;
  }

  drawTimelineState(sensorHandler: SensorHandler, state: any, expectedState: any, type: string, drawParameters: SensorDrawTimeLineParameters) {
    const {startx, color, strokewidth, stateLenght} = drawParameters;

    const stateToFA = [
      "\uf062",
      "\uf063",
      "\uf060",
      "\uf061",
      "\uf111",
    ]

    let spacing = this.context.timeLineSlotHeight / 5;
    for (let i = 0; i < 5; i++) {
      if (state && state[i]) {
        let ypos = this.drawInfo.y + (i * spacing);
        let startingpath = ["M", startx,
          ypos,
          "L", startx,
          ypos];

        let targetpath = ["M", startx,
          ypos,
          "L", startx + stateLenght,
          ypos];

        let stateline;
        if (type == "expected")
        {
          stateline = this.context.paper.path(targetpath);
        }
        else
        {
          stateline = this.context.paper.path(startingpath);
          stateline.animate({path: targetpath}, 200);
        }

        stateline.attr({
          "stroke-width": 2,
          "stroke": color,
          "stroke-linejoin": "round",
          "stroke-linecap": "round"
        });

        drawParameters.drawnElements.push(stateline);
        this.context.sensorStates.push(stateline);

        if (type == "expected") {
          this.stateArrow = this.context.paper.text(startx, ypos + 7, stateToFA[i]);
          this.context.sensorStates.push(this.stateArrow);

          this.stateArrow.attr({
            "text-anchor": "start",
            "font": "Font Awesome 5 Free",
            "stroke": color,
            "fill": color,
            "font-size": (strokewidth * 2) + "px"
          });

          this.stateArrow.node.style.fontFamily = '"Font Awesome 5 Free"';
          this.stateArrow.node.style.fontWeight = "bold";
        }
      }
    }
  }
}
