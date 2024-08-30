import {getImg, textEllipsis} from "../util";
import {buzzerSound} from "./buzzer_sound";
import {gyroscope3D} from "./gyroscope3d";
import {SensorHandler} from "./sensor_handler";

const colors = {
  blue: "#4a90e2",
  orange: "#f5a623"
}

export class SensorDrawer {
  private context;
  private strings;
  private sensorHandler: SensorHandler;
  private sensorDefinitions;

  constructor(context, strings, sensorDefinitions, sensorHandler) {
    this.context = context;
    this.strings = strings;
    this.sensorHandler = sensorHandler;
    this.sensorDefinitions = sensorDefinitions;
  }

  sensorInConnectedModeError() {
    window.displayHelper.showPopupMessage(this.strings.messages.sensorInOnlineMode, 'blanket');
  }

  actuatorsInRunningModeError() {
    window.displayHelper.showPopupMessage(this.strings.messages.actuatorsWhenRunning, 'blanket');
  }

  saveSensorStateIfNotRunning(sensor) {
    // save the sensor if we are not running
    if (!(this.context.runner && this.context.runner.isRunning())) {
      if (this._findFirst(this.sensorDefinitions, (globalSensor) => {
        return globalSensor.name === sensor.type;
      }).isSensor) {
        this.context.sensorsSaved[sensor.name] = {
          state: Array.isArray(sensor.state) ? sensor.state.slice() : sensor.state,
          screenDrawing: sensor.screenDrawing,
          lastDrawnTime: sensor.lastDrawnTime,
          lastDrawnState: sensor.lastDrawnState,
          callsInTimeSlot: sensor.callsInTimeSlot,
          lastTimeIncrease: sensor.lastTimeIncrease,
          removed: sensor.removed,
          quickStore: sensor.quickStore
        };
      }
    }
  }

  _findFirst(array, func) {
    for (let i = 0; i < array.length; i++) {
      if (func(array[i]))
        return array[i];
    }
    return undefined;
  }

  drawSensor(sensor, juststate = false, donotmovefocusrect = false) {
    // console.log('draw sensor', sensor, this.context, this.context.paper);
    // console.log(sensor.type)
    this.saveSensorStateIfNotRunning(sensor);
    if (this.context.sensorStateListener) {
      this.context.sensorStateListener(sensor);
    }

    let sameFont = true;
    let fontWeight = "normal";
    let sideTextSmall = false;

    if (this.context.paper == undefined || !this.context.display || !sensor.drawInfo)
      return;

    const irRemoteDialog = "<div class=\"content qpi\">" +
      "   <div class=\"panel-heading\">" +
      "       <h2 class=\"sectionTitle\">" +
      "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
      this.strings.messages.irRemoteControl +
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
      "       <button id=\"picancel2\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + this.strings.messages.closeDialog + "</button>" +
      "   </div>" +
      "</div>";

    let scrolloffset = 0;
    let fadeopacity = 1;

    let w = sensor.drawInfo.width;
    let h = sensor.drawInfo.height;
    let x = sensor.drawInfo.x;
    let y = sensor.drawInfo.y;
    let cx = x + w / 2;
    let cy = y + h / 2;

    let imgh = h / 2;
    let imgw = imgh;

    let imgx = x - (imgw / 2) + (w / 2);
    let imgy = y + (h - imgh) / 2;

    let namex = x + (w / 2);
    let namey = y + h / 8;
    let nameanchor = "middle";
    // this.context.paper.path(["M",x,namey,"H",x + w])

    let state1x = x + (w / 2)
    let state1y = y + h - h / 8;
    let stateanchor = "middle";
    // this.context.paper.path(["M",x,state1y,"H",x + w])
    // console.log(state1y)

    if (sensor.type == "accelerometer" ||
      sensor.type == "gyroscope" ||
      sensor.type == "magnetometer" ||
      sensor.type == "stick") {
      if (this.context.compactLayout)
        imgx = x + 5;
      else
        imgx = x - (imgw / 4) + (w / 4);

      let dx = w * 0.03;
      imgx = cx - imgw - dx;

      state1x = (imgx + imgw) + 10;
      state1y = y + h / 2;
      stateanchor = 'start';

      imgy += h * 0.05;
      state1y += h * 0.05;

    }
    if (sensor.type == "buzzer") {
      let sizeRatio = imgw / w;
      if (sizeRatio > 0.75) {
        imgw = 0.75 * w;
        imgh = imgw;
      }
    }


    let portx = state1x;
    let porty = imgy;


    let portsize = sensor.drawInfo.height * 0.11;

    // if (this.context.compactLayout)
    //     let statesize = sensor.drawInfo.height * 0.14;
    // else
    //     let statesize = sensor.drawInfo.height * 0.10;

    let namesize = sensor.drawInfo.height * 0.15;
    let statesize = namesize;
    portsize = namesize;

    let maxNameSize = 25;
    let maxStateSize = 20;
    // console.log(this.context.compactLayout,statesize)


    let drawPortText = true;
    let drawName = true;

    drawPortText = false;

    if (!sensor.focusrect || this.sensorHandler.isElementRemoved(sensor.focusrect)) {
      sensor.focusrect = this.context.paper.rect(imgx, imgy, imgw, imgh);
    }

    sensor.focusrect.attr({
      "fill": "468DDF",
      "fill-opacity": 0,
      "opacity": 0,
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
    });

    if (this.context.autoGrading) {

      scrolloffset = $('#virtualSensors').scrollLeft();

      if (scrolloffset > 0)
        fadeopacity = 0.3;

      imgw = w * .80;
      imgh = sensor.drawInfo.height * .80;

      imgx = sensor.drawInfo.x + (imgw * 0.75) + scrolloffset;
      imgy = sensor.drawInfo.y + (sensor.drawInfo.height / 2) - (imgh / 2);

      state1x = imgx + imgw * 1.2;
      state1y = imgy + (imgh / 2);

      portx = x;
      porty = imgy + (imgh / 2);

      portsize = imgh / 3;
      statesize = sensor.drawInfo.height * 0.2;

      namex = portx;
      namesize = portsize;
      nameanchor = "start";
    }
    namesize = Math.min(namesize, maxNameSize);
    statesize = Math.min(statesize, maxStateSize);
    if (sameFont) {
      // namesize = h*0.12;
      statesize = namesize;
      // console.log(statesize)
    }

    let sensorAttr = {
      "x": imgx,
      "y": imgy,
      "width": imgw,
      "height": imgh,
    };

    if (sensor.type == "led") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state == null)
        sensor.state = 0;

      if (!sensor.ledoff || this.sensorHandler.isElementRemoved(sensor.ledoff)) {
        sensor.ledoff = this.context.paper.image(getImg('ledoff.png'), imgx, imgy, imgw, imgh);

        sensor.focusrect.click(() => {
          if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
            sensor.state = !sensor.state;
            this.sensorHandler.warnClientSensorStateChanged(sensor);
            this.drawSensor(sensor);
          } else {
            this.actuatorsInRunningModeError();
          }
        });
      }

      if (!sensor.ledon || this.sensorHandler.isElementRemoved(sensor.ledon)) {
        let imagename = "ledon-";
        if (sensor.subType)
          imagename += sensor.subType;
        else
          imagename += "red";

        imagename += ".png";
        sensor.ledon = this.context.paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
      }

      sensor.ledon.attr(sensorAttr);
      sensor.ledoff.attr(sensorAttr);

      if (sensor.showAsAnalog) {
        sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state);
      } else {
        if (sensor.state) {
          sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
        } else {
          sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
        }
      }

      if (sensor.state) {
        sensor.ledon.attr({"opacity": fadeopacity});
        sensor.ledoff.attr({"opacity": 0});
      } else {
        sensor.ledon.attr({"opacity": 0});
        sensor.ledoff.attr({"opacity": fadeopacity});
      }

      // let x = typeof sensor.state;

      if (typeof sensor.state == 'number') {
        sensor.ledon.attr({"opacity": sensor.state * fadeopacity});
        sensor.ledoff.attr({"opacity": fadeopacity});
      }


      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {

        this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function () {
        });
      }
    } else if (sensor.type == "ledrgb") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state == null)
        sensor.state = 0;

      if (!sensor.ledimage || this.sensorHandler.isElementRemoved(sensor.ledimage)) {
        let imagename = "ledoff.png";
        sensor.ledimage = this.context.paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
      }
      if (!sensor.ledcolor || this.sensorHandler.isElementRemoved(sensor.ledcolor)) {
        console.log('new ledcolor');
        sensor.ledcolor = this.context.paper.circle();
      }

      sensor.ledimage.attr(sensorAttr);
      sensor.ledcolor.attr(sensorAttr);
      sensor.ledcolor.attr({});

      sensor.ledcolor.attr({
        "cx": imgx + imgw/2,
        "cy": imgy + imgh*0.3,
        "r": imgh*0.15,
        fill: sensor.state ? `rgb(${sensor.state.join(',')})`: 'none',
        stroke: 'none',
        opacity: 0.5,
      });

      sensor.stateText = this.context.paper.text(state1x, state1y, `${sensor.state ? sensor.state.join(',') : ''  }`);

      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {

        this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function () {
        });
      }

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 255);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "leddim") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state == null)
        sensor.state = 0;

      if (!sensor.ledoff || this.sensorHandler.isElementRemoved(sensor.ledoff)) {
        sensor.ledoff = this.context.paper.image(getImg('ledoff.png'), imgx, imgy, imgw, imgh);
      }

      if (!sensor.ledon || this.sensorHandler.isElementRemoved(sensor.ledon)) {
        let imagename = "ledon-";
        if (sensor.subType)
          imagename += sensor.subType;
        else
          imagename += "red";

        imagename += ".png";
        sensor.ledon = this.context.paper.image(getImg(imagename), imgx, imgy, imgw, imgh);
      }

      sensor.ledon.attr(sensorAttr);
      sensor.ledoff.attr(sensorAttr);

      sensor.stateText = this.context.paper.text(state1x, state1y, Math.round(100 * sensor.state) + '%');

      if (sensor.state) {
        sensor.ledon.attr({"opacity": fadeopacity});
        sensor.ledoff.attr({"opacity": 0});
      } else {
        sensor.ledon.attr({"opacity": 0});
        sensor.ledoff.attr({"opacity": fadeopacity});
      }

      if (typeof sensor.state == 'number') {
        sensor.ledon.attr({"opacity": sensor.state * fadeopacity});
        sensor.ledoff.attr({"opacity": fadeopacity});
      }

      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {

        this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function () {
        });
      }

      if (!this.context.autoGrading &&
        (!this.context.runner || !this.context.runner.isRunning())) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 1);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "ledmatrix") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.state || !sensor.state.length)
        sensor.state = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

      let ledmatrixOnAttr = {
        "fill": "red",
        "stroke": "darkgray"
      };
      let ledmatrixOffAttr = {
        "fill": "lightgray",
        "stroke": "darkgray"
      };

      if (!sensor.ledmatrix || this.sensorHandler.isElementRemoved(sensor.ledmatrix[0][0])) {
        sensor.ledmatrix = [];
        for (let i = 0; i < 5; i++) {
          sensor.ledmatrix[i] = [];
          for (let j = 0; j < 5; j++) {
            sensor.ledmatrix[i][j] = this.context.paper.rect(imgx + (imgw / 5) * i, imgy + (imgh / 5) * j, imgw / 5, imgh / 5);
            sensor.ledmatrix[i][j].attr(ledmatrixOffAttr);
          }
        }
      }

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (sensor.state[i][j]) {
            sensor.ledmatrix[i][j].attr(ledmatrixOnAttr);
          } else {
            sensor.ledmatrix[i][j].attr(ledmatrixOffAttr);
          }
        }
      }

      const ledMatrixListener = (imgx, imgy, imgw, imgh, sensor) => {
        return (e) => {
          let i = Math.floor((e.offsetX - imgx) / (imgw / 5));
          let j = Math.floor((e.offsetY - imgy) / (imgh / 5));
          sensor.state[i][j] = !sensor.state[i][j] ? 1 : 0;
          this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, () => {
          });
          this.drawSensor(sensor);
        }
      }

      sensor.focusrect.unclick();
      sensor.focusrect.click(ledMatrixListener(imgx, imgy, imgw, imgh, sensor));
    } else if (sensor.type == "buzzer") {
      if (typeof sensor.state == 'number' &&
        sensor.state != 0 &&
        sensor.state != 1) {
        buzzerSound.start(sensor.name, sensor.state);
      } else if (sensor.state) {
        buzzerSound.start(sensor.name);
      } else {
        buzzerSound.stop(sensor.name);
      }

      if (!juststate) {
        if (sensor.muteBtn) {
          sensor.muteBtn.remove();
        }


        // let muteBtnSize = w * 0.15;
        let muteBtnSize = imgw * 0.3;
        sensor.muteBtn = this.context.paper.text(
          imgx + imgw * 0.8,
          imgy + imgh * 0.8,
          buzzerSound.isMuted(sensor.name) ? "\uf6a9" : "\uf028"
        );
        sensor.muteBtn.node.style.fontWeight = "bold";
        sensor.muteBtn.node.style.cursor = "default";
        sensor.muteBtn.node.style.MozUserSelect = "none";
        sensor.muteBtn.node.style.WebkitUserSelect = "none";
        sensor.muteBtn.attr({
          "font-size": muteBtnSize + "px",
          fill: buzzerSound.isMuted(sensor.name) ? "lightgray" : "#468DDF",
          "font-family": '"Font Awesome 5 Free"',
          'text-anchor': 'start',
          "cursor": "pointer"
        });
        let bbox = sensor.muteBtn.getBBox();

        sensor.muteBtn.click(() => {
          if (buzzerSound.isMuted(sensor.name)) {
            buzzerSound.unmute(sensor.name)
          } else {
            buzzerSound.mute(sensor.name)
          }
          this.drawSensor(sensor);
        });
        sensor.muteBtn.toFront();
      }


      if (!sensor.buzzeron || this.sensorHandler.isElementRemoved(sensor.buzzeron))
        sensor.buzzeron = this.context.paper.image(getImg('buzzer-ringing.png'), imgx, imgy, imgw, imgh);

      if (!sensor.buzzeroff || this.sensorHandler.isElementRemoved(sensor.buzzeroff)) {
        sensor.buzzeroff = this.context.paper.image(getImg('buzzer.png'), imgx, imgy, imgw, imgh);

        sensor.focusrect.click(() => {
          if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
            sensor.state = !sensor.state;
            this.sensorHandler.warnClientSensorStateChanged(sensor);
            this.drawSensor(sensor);
          } else {
            this.actuatorsInRunningModeError();
          }
        });
      }

      if (sensor.state) {
        if (!sensor.buzzerInterval) {
          sensor.buzzerInterval = setInterval(() => {

            if (!sensor.removed) {
              sensor.ringingState = !sensor.ringingState;
              this.drawSensor(sensor, true, true);
            } else {
              clearInterval(sensor.buzzerInterval);
            }

          }, 100);
        }
      } else {
        if (sensor.buzzerInterval) {
          clearInterval(sensor.buzzerInterval);
          sensor.buzzerInterval = null;
          sensor.ringingState = null;
        }
      }
      sensor.buzzeron.attr(sensorAttr);
      sensor.buzzeroff.attr(sensorAttr);

      let drawState = sensor.state;
      if (sensor.ringingState != null)
        drawState = sensor.ringingState;

      if (drawState) {
        sensor.buzzeron.attr({"opacity": fadeopacity});
        sensor.buzzeroff.attr({"opacity": 0});


      } else {
        sensor.buzzeron.attr({"opacity": 0});
        sensor.buzzeroff.attr({"opacity": fadeopacity});
      }

      if (sensor.stateText)
        sensor.stateText.remove();

      let stateText = this.sensorHandler.findSensorDefinition(sensor).getStateString(sensor.state);

      sensor.stateText = this.context.paper.text(state1x, state1y, stateText);


      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {

        let setLiveState = this.sensorHandler.findSensorDefinition(sensor).setLiveState;

        if (setLiveState) {
          setLiveState(sensor, sensor.state, function () {
          });
        }
      }

    } else if (sensor.type == "button") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.buttonon || this.sensorHandler.isElementRemoved(sensor.buttonon))
        sensor.buttonon = this.context.paper.image(getImg('buttonon.png'), imgx, imgy, imgw, imgh);

      if (!sensor.buttonoff || this.sensorHandler.isElementRemoved(sensor.buttonoff))
        sensor.buttonoff = this.context.paper.image(getImg('buttonoff.png'), imgx, imgy, imgw, imgh);

      if (sensor.state == null)
        sensor.state = false;

      sensor.buttonon.attr(sensorAttr);
      sensor.buttonoff.attr(sensorAttr);

      if (sensor.state) {
        sensor.buttonon.attr({"opacity": fadeopacity});
        sensor.buttonoff.attr({"opacity": 0});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
      } else {
        sensor.buttonon.attr({"opacity": 0});
        sensor.buttonoff.attr({"opacity": fadeopacity});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
      }

      if (!this.context.autoGrading && !sensor.buttonon.node.onmousedown) {
        sensor.focusrect.node.onmousedown = () => {
          if (this.context.offLineMode) {
            sensor.state = true;
            this.sensorHandler.warnClientSensorStateChanged(sensor);
            this.drawSensor(sensor);
          } else
            this.sensorInConnectedModeError();
        };


        sensor.focusrect.node.onmouseup = () => {
          if (this.context.offLineMode) {
            sensor.state = false;
            sensor.wasPressed = true;
            this.sensorHandler.warnClientSensorStateChanged(sensor);
            this.drawSensor(sensor);

            if (sensor.onPressed)
              sensor.onPressed();
          } else
            this.sensorInConnectedModeError();
        }

        sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
        sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
      }
    } else if (sensor.type == "galaxia") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.galaxia || this.sensorHandler.isElementRemoved(sensor.galaxia))
        sensor.galaxia = this.context.paper.image(getImg('galaxia.svg'), imgx, imgy, imgw, imgh);

      if (sensor.state == null)
        sensor.state = false;

      sensor.galaxia.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
      });

      if (sensor.state) {
        /*sensor.buttonon.attr({ "opacity": fadeopacity });
        sensor.buttonoff.attr({ "opacity": 0 });*/
      } else {
        /*sensor.buttonon.attr({ "opacity": 0 });
        sensor.buttonoff.attr({ "opacity": fadeopacity });*/
      }

      if (!this.context.autoGrading) {
        // sensor.focusrect.node.onmousedown = () => {
        //     if (this.context.offLineMode) {
        //         sensor.state = true;
        //         this.sensorHandler.warnClientSensorStateChanged(sensor);
        //         this.drawSensor(sensor);
        //     } else
        //         this.sensorInConnectedModeError();
        // };


        // sensor.focusrect.node.onmouseup = () => {
        //     if (this.context.offLineMode) {
        //         sensor.state = false;
        //         sensor.wasPressed = true;
        //         this.sensorHandler.warnClientSensorStateChanged(sensor);
        //         this.drawSensor(sensor);

        //         if (sensor.onPressed)
        //             sensor.onPressed();
        //     } else
        //         this.sensorInConnectedModeError();
        // }

        // sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
        // sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
      }
    } else if (sensor.type == "screen") {
      if (sensor.stateText) {
        sensor.stateText.remove();
        sensor.stateText = null;
      }

      let borderSize = 5;

      let screenScale = 1.5;
      if (w < 300) {
        screenScale = 1;
      }
      if (w < 150) {
        screenScale = 0.5;
      }
      // console.log(screenScale,w,h)

      let screenScalerSize = {
        width: 128 * screenScale,
        height: 32 * screenScale
      }
      borderSize = borderSize * screenScale;

      imgw = screenScalerSize.width + borderSize * 2;
      imgh = screenScalerSize.height + borderSize * 2;
      imgx = x - (imgw / 2) + (w / 2);

      imgy = y + (h - imgh) / 2 + h * 0.05;

      portx = imgx + imgw + borderSize;
      porty = imgy + imgh / 3;

      statesize = imgh / 3.5;

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img)) {
        sensor.img = this.context.paper.image(getImg('screen.png'), imgx, imgy, imgw, imgh);
      }

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      if (sensor.state) {
        if (sensor.state.isDrawingData) {
          if (!sensor.screenrect ||
            this.sensorHandler.isElementRemoved(sensor.screenrect) ||
            !sensor.canvasNode) {
            sensor.screenrect = this.context.paper.rect(imgx, imgy, screenScalerSize.width, screenScalerSize.height);

            sensor.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
            sensor.canvasNode.setAttribute("x", imgx + borderSize); //Set rect data
            sensor.canvasNode.setAttribute("y", imgy + borderSize); //Set rect data
            sensor.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
            sensor.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data
            this.context.paper.canvas.appendChild(sensor.canvasNode);

            sensor.canvas = document.createElement("canvas");
            sensor.canvas.id = "screencanvas";
            sensor.canvas.width = screenScalerSize.width;
            sensor.canvas.height = screenScalerSize.height;
            sensor.canvasNode.appendChild(sensor.canvas);
          }

          $(sensor.canvas).css({opacity: fadeopacity});
          sensor.canvasNode.setAttribute("x", imgx + borderSize); //Set rect data
          sensor.canvasNode.setAttribute("y", imgy + borderSize); //Set rect data
          sensor.canvasNode.setAttribute("width", screenScalerSize.width); //Set rect data
          sensor.canvasNode.setAttribute("height", screenScalerSize.height); //Set rect data

          sensor.screenrect.attr({
            "x": imgx + borderSize,
            "y": imgy + borderSize,
            "width": 128,
            "height": 32,
          });

          sensor.screenrect.attr({"opacity": 0});

          this.context.quickpi.initScreenDrawing(sensor);
          //sensor.screenDrawing.copyToCanvas(sensor.canvas, screenScale);
          screenDrawing.renderToCanvas(sensor.state, sensor.canvas, screenScale);
        } else {
          let statex = imgx + (imgw * .05);

          let statey = imgy + (imgh * .2);

          if (sensor.state.line1.length > 16)
            sensor.state.line1 = sensor.state.line1.substring(0, 16);

          if (sensor.state.line2 && sensor.state.line2.length > 16)
            sensor.state.line2 = sensor.state.line2.substring(0, 16);

          if (sensor.canvasNode) {
            $(sensor.canvasNode).remove();
            sensor.canvasNode = null;
          }

          sensor.stateText = this.context.paper.text(statex, statey, sensor.state.line1 + "\n" + (sensor.state.line2 ? sensor.state.line2 : ""));
          stateanchor = "start";
          sensor.stateText.attr("")
        }
      }
    } else if (sensor.type == "temperature") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state == null)
        sensor.state = 25; // FIXME

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('temperature-cold.png'), imgx, imgy, imgw, imgh);

      if (!sensor.img2 || this.sensorHandler.isElementRemoved(sensor.img2))
        sensor.img2 = this.context.paper.image(getImg('temperature-hot.png'), imgx, imgy, imgw, imgh);

      if (!sensor.img3 || this.sensorHandler.isElementRemoved(sensor.img3))
        sensor.img3 = this.context.paper.image(getImg('temperature-overlay.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,

      });
      sensor.img2.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      sensor.img3.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      let scale = imgh / 60;

      let cliph = scale * sensor.state;

      sensor.img2.attr({
        "clip-rect":
          imgx + "," +
          (imgy + imgh - cliph) + "," +
          (imgw) + "," +
          cliph
      });

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + " °C");

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 60);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }

    } else if (sensor.type == "servo") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('servo.png'), imgx, imgy, imgw, imgh);

      if (!sensor.pale || this.sensorHandler.isElementRemoved(sensor.pale))
        sensor.pale = this.context.paper.image(getImg('servo-pale.png'), imgx, imgy, imgw, imgh);


      if (!sensor.center || this.sensorHandler.isElementRemoved(sensor.center))
        sensor.center = this.context.paper.image(getImg('servo-center.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });
      sensor.pale.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "transform": "",
        "opacity": fadeopacity,
      });
      sensor.center.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      sensor.pale.rotate(sensor.state);

      if (sensor.state == null)
        sensor.state = 0;

      sensor.state = Math.round(sensor.state);

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + "°");

      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {
        if (!sensor.updatetimeout) {
          sensor.updatetimeout = setTimeout(() => {

            this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function () {
            });

            sensor.updatetimeout = null;
          }, 100);
        }
      }

      if (!this.context.autoGrading &&
        (!this.context.runner || !this.context.runner.isRunning())) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 180);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "potentiometer") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('potentiometer.png'), imgx, imgy, imgw, imgh);

      if (!sensor.pale || this.sensorHandler.isElementRemoved(sensor.pale))
        sensor.pale = this.context.paper.image(getImg('potentiometer-pale.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      sensor.pale.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "transform": "",
        "opacity": fadeopacity,
      });

      if (sensor.state == null)
        sensor.state = 0;

      sensor.pale.rotate(sensor.state * 3.6);

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + "%");

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }

    } else if (sensor.type == "range") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('range.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy - imgh * 0.1,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      if (sensor.state == null)
        sensor.state = 500;

      if (sensor.rangedistance)
        sensor.rangedistance.remove();

      if (sensor.rangedistancestart)
        sensor.rangedistancestart.remove();

      if (sensor.rangedistanceend)
        sensor.rangedistanceend.remove();

      let rangew;

      if (sensor.state < 30) {
        rangew = imgw * sensor.state / 100;
      } else {
        let firstpart = imgw * 30 / 100;
        let remaining = imgw - firstpart;

        rangew = firstpart + (remaining * (sensor.state) * 0.0015);
      }

      let cx = imgx + (imgw / 2);
      let cy = imgy + imgh * 0.85;
      let x1 = cx - rangew / 2;
      let x2 = cx + rangew / 2;
      let markh = 12;
      let y1 = cy - markh / 2;
      let y2 = cy + markh / 2;

      sensor.rangedistance = this.context.paper.path(["M", x1, cy, "H", x2]);
      sensor.rangedistancestart = this.context.paper.path(["M", x1, y1, "V", y2]);
      sensor.rangedistanceend = this.context.paper.path(["M", x2, y1, "V", y2]);

      sensor.rangedistance.attr({
        "stroke-width": 4,
        "stroke": "#468DDF",
        "stroke-linecapstring": "round"
      });

      sensor.rangedistancestart.attr({
        "stroke-width": 4,
        "stroke": "#468DDF",
        "stroke-linecapstring": "round"
      });


      sensor.rangedistanceend.attr({
        "stroke-width": 4,
        "stroke": "#468DDF",
        "stroke-linecapstring": "round"
      });

      if (sensor.state >= 10)
        sensor.state = Math.round(sensor.state);

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + " cm");
      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 500);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "light") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('light.png'), imgx, imgy, imgw, imgh);

      if (!sensor.moon || this.sensorHandler.isElementRemoved(sensor.moon))
        sensor.moon = this.context.paper.image(getImg('light-moon.png'), imgx, imgy, imgw, imgh);

      if (!sensor.sun || this.sensorHandler.isElementRemoved(sensor.sun))
        sensor.sun = this.context.paper.image(getImg('light-sun.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      if (sensor.state == null)
        sensor.state = 0;

      if (sensor.state > 50) {
        let opacity = (sensor.state - 50) * 0.02;
        sensor.sun.attr({
          "x": imgx,
          "y": imgy,
          "width": imgw,
          "height": imgh,
          "opacity": opacity * .80 * fadeopacity
        });
        sensor.moon.attr({"opacity": 0});
      } else {
        let opacity = (50 - sensor.state) * 0.02;
        sensor.moon.attr({
          "x": imgx,
          "y": imgy,
          "width": imgw,
          "height": imgh,
          "opacity": opacity * .80 * fadeopacity
        });
        sensor.sun.attr({"opacity": 0});
      }

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + "%");
      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "humidity") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('humidity.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      if (sensor.state == null)
        sensor.state = 0;

      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + "%");
      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 100);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "accelerometer") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('accel.png'), imgx, imgy, imgw, imgh);

      // this.context.paper.rect(x,y,w,h)
      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });


      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.state) {
        sensor.state = [0, 0, 1];
      }

      if (sensor.state) {
        if (sideTextSmall)
          statesize = h * 0.12;
        try {
          let str = "X: " + sensor.state[0] + " m/s²\nY: " + sensor.state[1] + " m/s²\nZ: " + sensor.state[2] + " m/s²";
          sensor.stateText = this.context.paper.text(cx, state1y, str);
        } catch (Err) {
          let a = 1;
        }
        // let bbox = sensor.stateText.getBBox();
        // sensor.stateText.attr("y",cy - bbox.height/2);
      }

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -8 * 9.81, 8 * 9.81);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "gyroscope") {
      if (!sensor.state) {
        sensor.state = [0, 0, 0];
      }
      if (sensor.stateText) {
        sensor.stateText.remove();
      }
      if (sideTextSmall)
        statesize = h * 0.12;

      let str = "X: " + sensor.state[0] + "°/s\nY: " + sensor.state[1] + "°/s\nZ: " + sensor.state[2] + "°/s";
      sensor.stateText = this.context.paper.text(cx, state1y, str);
      if (!sensor.previousState)
        sensor.previousState = [0, 0, 0];

      if (sensor.rotationAngles != undefined) {

        // update the rotation angle
        for (let i = 0; i < 3; i++)
          sensor.rotationAngles[i] += sensor.previousState[i] * ((+new Date() - sensor.lastSpeedChange) / 1000);

        sensor.lastSpeedChange = new Date();
      }


      sensor.previousState = sensor.state;

      let img3d = null;
      if (!this.context.autoGrading && this.context.offLineMode) {
        img3d = gyroscope3D.getInstance(imgw, imgh);
      }
      if (img3d) {
        if (!sensor.screenrect || this.sensorHandler.isElementRemoved(sensor.screenrect)) {
          sensor.screenrect = this.context.paper.rect(imgx, imgy, imgw, imgh);
          sensor.screenrect.attr({"opacity": 0});

          sensor.canvasNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
          sensor.canvasNode.setAttribute("x", imgx);
          sensor.canvasNode.setAttribute("y", imgy);
          sensor.canvasNode.setAttribute("width", imgw);
          sensor.canvasNode.setAttribute("height", imgh);
          this.context.paper.canvas.appendChild(sensor.canvasNode);

          sensor.canvas = document.createElement("canvas");
          sensor.canvas.width = imgw;
          sensor.canvas.height = imgh;
          sensor.canvasNode.appendChild(sensor.canvas);
        }

        let sensorCtx = sensor.canvas.getContext('2d');
        sensorCtx.clearRect(0, 0, imgw, imgh);

        sensorCtx.drawImage(img3d.render(
          sensor.state[0],
          sensor.state[2],
          sensor.state[1]
        ), 0, 0);

        if (!juststate) {
          sensor.focusrect.drag(
            (dx, dy, x, y, event) => {
              sensor.state[0] = Math.max(-125, Math.min(125, sensor.old_state[0] + dy));
              sensor.state[1] = Math.max(-125, Math.min(125, sensor.old_state[1] - dx));
              this.sensorHandler.warnClientSensorStateChanged(sensor);
              this.drawSensor(sensor, true)
            },
            () => {
              sensor.old_state = sensor.state.slice();
            }
          );
        }

      } else {

        if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img)) {
          sensor.img = this.context.paper.image(getImg('gyro.png'), imgx, imgy, imgw, imgh);
        }
        sensor.img.attr({
          "x": imgx,
          "y": imgy,
          "width": imgw,
          "height": imgh,
          "opacity": fadeopacity,
        });
        if (!this.context.autoGrading && this.context.offLineMode) {
          this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -125, 125);
        } else {
          sensor.focusrect.click(() => {
            this.sensorInConnectedModeError();
          });

          this.removeSlider(sensor);
        }
      }
    } else if (sensor.type == "magnetometer") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('mag.png'), imgx, imgy, imgw, imgh);

      if (!sensor.needle || this.sensorHandler.isElementRemoved(sensor.needle))
        sensor.needle = this.context.paper.image(getImg('mag-needle.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      sensor.needle.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "transform": "",
        "opacity": fadeopacity,
      });

      if (!sensor.state) {
        sensor.state = [0, 0, 0];
      }

      if (sensor.state) {
        let heading = Math.atan2(sensor.state[0], sensor.state[1]) * (180 / Math.PI) + 180;

        sensor.needle.rotate(heading);
      }

      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state) {
        if (sideTextSmall)
          statesize = h * 0.12;

        let str = "X: " + sensor.state[0] + " μT\nY: " + sensor.state[1] + " μT\nZ: " + sensor.state[2] + " μT";
        sensor.stateText = this.context.paper.text(cx, state1y, str);
      }

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, -1600, 1600);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }
    } else if (sensor.type == "sound") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (sensor.state == null)
        sensor.state = 25; // FIXME

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('sound.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      // if we just do sensor.state, if it is equal to 0 then the state is not displayed
      if (sensor.state != null) {
        sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state + " dB");
      }

      if (!this.context.autoGrading && this.context.offLineMode) {
        this.setSlider(sensor, juststate, imgx, imgy, imgw, imgh, 0, 60);
      } else {
        sensor.focusrect.click(() => {
          this.sensorInConnectedModeError();
        });

        this.removeSlider(sensor);
      }

    } else if (sensor.type == "irtrans") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.ledon || this.sensorHandler.isElementRemoved(sensor.ledon)) {
        sensor.ledon = this.context.paper.image(getImg("irtranson.png"), imgx, imgy, imgw, imgh);
      }

      if (!sensor.ledoff || this.sensorHandler.isElementRemoved(sensor.ledoff)) {
        sensor.ledoff = this.context.paper.image(getImg('irtransoff.png'), imgx, imgy, imgw, imgh);

        sensor.focusrect.click(() => {
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
              if (sensor.state) {
                t = document.createTextNode(this.strings.messages.irDisableContinous);
              }

              btn.className = "btn";
              btn.appendChild(t);
              parentdiv.appendChild(btn);
              btn.onclick = () => {
                $('#popupMessage').hide();
                window.displayHelper.popupMessageShown = false;

                sensor.state = !sensor.state;
                this.sensorHandler.warnClientSensorStateChanged(sensor);
                this.drawSensor(sensor);
              };
            });
          } else {
            this.actuatorsInRunningModeError();
          }
        });
      }

      sensor.ledon.attr(sensorAttr);
      sensor.ledoff.attr(sensorAttr);

      if (sensor.state) {
        sensor.ledon.attr({"opacity": fadeopacity});
        sensor.ledoff.attr({"opacity": 0});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
      } else {
        sensor.ledon.attr({"opacity": 0});
        sensor.ledoff.attr({"opacity": fadeopacity});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
      }


      if ((!this.context.runner || !this.context.runner.isRunning())
        && !this.context.offLineMode) {

        this.sensorHandler.findSensorDefinition(sensor).setLiveState(sensor, sensor.state, function () {
        });
      }
    } else if (sensor.type == "irrecv") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.buttonon || this.sensorHandler.isElementRemoved(sensor.buttonon))
        sensor.buttonon = this.context.paper.image(getImg('irrecvon.png'), imgx, imgy, imgw, imgh);

      if (!sensor.buttonoff || this.sensorHandler.isElementRemoved(sensor.buttonoff))
        sensor.buttonoff = this.context.paper.image(getImg('irrecvoff.png'), imgx, imgy, imgw, imgh);

      sensor.buttonon.attr(sensorAttr);
      sensor.buttonoff.attr(sensorAttr);

      if (sensor.state) {
        sensor.buttonon.attr({"opacity": fadeopacity});
        sensor.buttonoff.attr({"opacity": 0});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.on.toUpperCase());
      } else {
        sensor.buttonon.attr({"opacity": 0});
        sensor.buttonoff.attr({"opacity": fadeopacity});

        sensor.stateText = this.context.paper.text(state1x, state1y, this.strings.messages.off.toUpperCase());
      }

      sensor.focusrect.click(() => {
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

                if (sensor.waitingForIrMessage)
                  sensor.waitingForIrMessage(capturedcode);
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
            if (sensor.state) {
              t = document.createTextNode(this.strings.messages.irDisableContinous);
            }

            btn.className = "btn";
            btn.appendChild(t);
            parentdiv.appendChild(btn);
            btn.onclick = () => {
              $('#popupMessage').hide();
              window.displayHelper.popupMessageShown = false;

              sensor.state = !sensor.state;
              this.sensorHandler.warnClientSensorStateChanged(sensor);
              this.drawSensor(sensor);
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
    } else if (sensor.type == "stick") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('stick.png'), imgx, imgy, imgw, imgh);

      if (!sensor.imgup || this.sensorHandler.isElementRemoved(sensor.imgup))
        sensor.imgup = this.context.paper.image(getImg('stickup.png'), imgx, imgy, imgw, imgh);

      if (!sensor.imgdown || this.sensorHandler.isElementRemoved(sensor.imgdown))
        sensor.imgdown = this.context.paper.image(getImg('stickdown.png'), imgx, imgy, imgw, imgh);

      if (!sensor.imgleft || this.sensorHandler.isElementRemoved(sensor.imgleft))
        sensor.imgleft = this.context.paper.image(getImg('stickleft.png'), imgx, imgy, imgw, imgh);

      if (!sensor.imgright || this.sensorHandler.isElementRemoved(sensor.imgright))
        sensor.imgright = this.context.paper.image(getImg('stickright.png'), imgx, imgy, imgw, imgh);

      if (!sensor.imgcenter || this.sensorHandler.isElementRemoved(sensor.imgcenter))
        sensor.imgcenter = this.context.paper.image(getImg('stickcenter.png'), imgx, imgy, imgw, imgh);

      let a = {
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": 0,
      };
      sensor.img.attr(a).attr("opacity", fadeopacity);

      sensor.imgup.attr(a);
      sensor.imgdown.attr(a);
      sensor.imgleft.attr(a);
      sensor.imgright.attr(a);
      sensor.imgcenter.attr(a);

      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.state)
        sensor.state = [false, false, false, false, false];

      // let stateString = "\n";
      let stateString = "";
      let click = false;
      if (sensor.state[0]) {
        stateString += this.strings.messages.up.toUpperCase() + "\n";
        sensor.imgup.attr({"opacity": 1});
        click = true;
      }
      if (sensor.state[1]) {
        stateString += this.strings.messages.down.toUpperCase() + "\n";
        sensor.imgdown.attr({"opacity": 1});
        click = true;
      }
      if (sensor.state[2]) {
        stateString += this.strings.messages.left.toUpperCase() + "\n";
        sensor.imgleft.attr({"opacity": 1});
        click = true;
      }
      if (sensor.state[3]) {
        stateString += this.strings.messages.right.toUpperCase() + "\n";
        sensor.imgright.attr({"opacity": 1});
        click = true;
      }
      if (sensor.state[4]) {
        stateString += this.strings.messages.center.toUpperCase() + "\n";
        sensor.imgcenter.attr({"opacity": 1});
        click = true;
      }
      if (!click) {
        stateString += "...";
      }

      sensor.stateText = this.context.paper.text(state1x, state1y, stateString);

      if (sensor.portText)
        sensor.portText.remove();

      drawPortText = false;

      if (sensor.portText)
        sensor.portText.remove();

      if (!this.context.autoGrading) {
        let gpios = this.sensorHandler.findSensorDefinition(sensor).gpios;
        let min = 255;
        let max = 0;

        for (let i = 0; i < gpios.length; i++) {
          if (gpios[i] > max)
            max = gpios[i];

          if (gpios[i] < min)
            min = gpios[i];
        }


        $('#stickupstate').text(sensor.state[0] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
        $('#stickdownstate').text(sensor.state[1] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
        $('#stickleftstate').text(sensor.state[2] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
        $('#stickrightstate').text(sensor.state[3] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());
        $('#stickcenterstate').text(sensor.state[4] ? this.strings.messages.on.toUpperCase() : this.strings.messages.off.toUpperCase());

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

      sensor.focusrect.node.onmousedown = (evt) => {
        if (!this.context.offLineMode) {
          this.sensorInConnectedModeError();
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
          sensor.state[0] = true;
          sensor.state[2] = true;
        }

        // Up
        moveRect(rect, rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[0] = true;
        }

        // Up right
        moveRect(rect, rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[0] = true;
          sensor.state[3] = true;
        }

        // Right
        moveRect(rect, 0, rectsize);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[3] = true;
        }

        // Center
        moveRect(rect, -rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[4] = true;
        }

        // Left
        moveRect(rect, -rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[2] = true;
        }

        // Down left
        moveRect(rect, 0, rectsize);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[1] = true;
          sensor.state[2] = true;
        }

        // Down
        moveRect(rect, rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[1] = true;
        }

        // Down right
        moveRect(rect, rectsize, 0);
        if (poinInRect(rect, evt.clientX, evt.clientY)) {
          sensor.state[1] = true;
          sensor.state[3] = true;
        }

        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor);
      }

      sensor.focusrect.node.onmouseup = (evt) => {
        if (!this.context.offLineMode) {
          this.sensorInConnectedModeError();
          return;
        }

        sensor.state = [false, false, false, false, false];
        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor);
      }

      sensor.focusrect.node.ontouchstart = sensor.focusrect.node.onmousedown;
      sensor.focusrect.node.ontouchend = sensor.focusrect.node.onmouseup;
    } else if (sensor.type == "cloudstore") {
      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('cloudstore.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh * 0.8,
        "opacity": scrolloffset ? 0.3 : 1,
      });

      drawPortText = false;
      // drawName = false;

    } else if (sensor.type == "clock") {
      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img))
        sensor.img = this.context.paper.image(getImg('clock.png'), imgx, imgy, imgw, imgh);

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
      });

      sensor.stateText = this.context.paper.text(state1x, state1y, this.context.currentTime.toString() + "ms");

      drawPortText = false;
      drawName = false;
    } else if (sensor.type == "adder") {
      this.drawCustomSensorAdder(x, y, w, h, namesize);
      return
    } else if (sensor.type == "wifi") {
      if (sensor.stateText)
        sensor.stateText.remove();

      if (!sensor.img || this.sensorHandler.isElementRemoved(sensor.img)) {
        sensor.img = this.context.paper.image(getImg('wifi.png'), imgx, imgy, imgw, imgh);

        sensor.focusrect.click(() => {
          if (!this.context.autoGrading && (!this.context.runner || !this.context.runner.isRunning())) {
            sensor.state.connected = !sensor.state.connected;
            this.sensorHandler.warnClientSensorStateChanged(sensor);
            this.drawSensor(sensor);
          } else {
            this.actuatorsInRunningModeError();
          }
        });
      }

      if (!sensor.active || this.sensorHandler.isElementRemoved(sensor.active))
        sensor.active = this.context.paper.circle();

      const ssid = sensor.state?.ssid;
      sensor.stateText = this.context.paper.text(state1x, state1y, sensor.state?.scanning ? '...' : (ssid ? textEllipsis(ssid, 6) : ''));

      sensor.img.attr({
        "x": imgx,
        "y": imgy,
        "width": imgw,
        "height": imgh,
        "opacity": fadeopacity,
      });

      let color = 'grey';
      if (sensor.state?.active) {
        if (sensor.state.connected) {
          color = 'green';
        } else {
          color = 'red';
        }
      }

      sensor.active.attr({
        "cx": imgx + imgw*0.15,
        "cy": imgy + imgh*0.1,
        "r": imgh*0.15,
        fill: `${color}`,
        stroke: 'none',
        opacity: 1,
      });
    }


    if (sensor.stateText) {
      try {
        let statecolor = "gray";
        // if (this.context.compactLayout)
        //     statecolor = "black";
        // console.log(statesize)
        sensor.stateText.attr({
          "font-size": statesize,
          'text-anchor': stateanchor,
          'font-weight': fontWeight,
          fill: statecolor
        });
        // let b = sensor.stateText._getBBox();
        // sensor.stateText.translate(0, b.height/2);
        sensor.stateText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
      } catch (err) {
      }
    }


    if (drawPortText) {
      if (sensor.portText)
        sensor.portText.remove();

      sensor.portText = this.context.paper.text(portx, porty, sensor.port);
      sensor.portText.attr({"font-size": portsize + "px", 'text-anchor': 'start', fill: "gray"});
      sensor.portText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
      let b = sensor.portText._getBBox();
      sensor.portText.translate(0, b.height / 2);
    }

    if (sensor.nameText) {
      sensor.nameText.remove();
    }


    if (drawName) {
      if (sensor.name) {
        let sensorId = sensor.name;
        if (this.context.useportforname)
          sensorId = sensor.port;

        sensor.nameText = this.context.paper.text(namex, namey, sensorId);
        // sensor.nameText = this.context.paper.text(namex, namey, sensor.name );
        sensor.nameText.attr({
          "font-size": namesize,
          "font-weight": fontWeight,
          'text-anchor': nameanchor,
          fill: "#7B7B7B"
        });
        sensor.nameText.node.style = "-moz-user-select: none; -webkit-user-select: none;";
        let bbox = sensor.nameText.getBBox();
        if (bbox.width > w - 20) {
          namesize = namesize * (w - 20) / bbox.width;
          namey += namesize * (1 - (w - 20) / bbox.width);
          sensor.nameText.attr({
            "font-size": namesize,
            y: namey
          });
        }
      }
    }


    if (!donotmovefocusrect) {
      // This needs to be in front of everything
      sensor.focusrect.toFront();
      if (sensor.muteBtn)
        sensor.muteBtn.toFront();
    }

    this.saveSensorStateIfNotRunning(sensor);
  }

  drawCustomSensorAdder(x, y, w, h, fontsize) {
    if (this.context.sensorAdder) {
      this.context.sensorAdder.remove();
    }
    // paper.rect(x,y,size,size)
    let r = Math.min(w,h)*0.2;
    let cx = x + w / 2;
    let cy = y + h*0.4;
    let plusSize = r*0.8;
    let x1 = cx - plusSize/2;
    let x2 = cx + plusSize/2;
    let y1 = cy - plusSize/2;
    let y2 = cy + plusSize/2;
    let yText = y + h - (h/2 - r)/2;
    // let fontsize = h * .15;
    let sSize1 = 2*h/100;
    let sSize2 = 3*h/100;
    // console.log(h)

    let circ = this.context.paper.circle(cx,cy,r).attr({
      stroke: colors.blue,
      "stroke-width": sSize1,
      fill: "white"
    });
    let plus = this.context.paper.path(["M",cx,y1,"V",y2,"M",x1,cy,"H",x2]).attr({
      stroke: colors.blue,
      "stroke-width": sSize2,
      "stroke-linecap": "round"
    });
    let text = this.context.paper.text(cx,yText,this.strings.messages.add).attr({
      "font-size": fontsize,
      "font-weight": "bold",
      fill: colors.blue
    });
    let rect = this.context.paper.rect(x,y,w,h).attr({
      stroke: "none",
      fill: "red",
      opacity: 0
    });
    // context.sensorAdder = paper.text(cx, cy, "+");
    this.context.sensorAdder = this.context.paper.set(circ,plus,text,rect);

    // context.sensorAdder.attr({
    //     "font-size": fontsize + "px",
    //     fill: "lightgray"
    // });
    // context.sensorAdder.node.style = "-moz-user-select: none; -webkit-user-select: none;";

    this.context.sensorAdder.click(this.clickAdder);

    //     window.displayHelper.showPopupDialog("<div class=\"content qpi\">" +
    //         "   <div class=\"panel-heading\">" +
    //         "       <h2 class=\"sectionTitle\">" +
    //         "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
    //                     strings.messages.addcomponent +
    //         "       </h2>" +
    //         "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
    //         "   </div>" +
    //         "   <div id=\"sensorPicker\" class=\"panel-body\">" +
    //         "       <label>" + strings.messages.selectcomponent + "</label>" +
    //         "       <div class=\"flex-container\">" +
    //         "           <div id=\"selector-image-container\" class=\"flex-col half\">" +
    //         "               <img id=\"selector-sensor-image\">" +
    //         "           </div>" +
    //         "           <div class=\"flex-col half\">" +
    //         "               <div class=\"form-group\">" +
    //         "                   <div class=\"input-group\">" +
    //         "                       <select id=\"selector-sensor-list\" class=\"custom-select\"></select>" +
    //         "                   </div>" +
    //         "              </div>" +
    //         "              <div class=\"form-group\">" +
    //         "                   <div class=\"input-group\">" +
    //         "                       <select id=\"selector-sensor-port\" class=\"custom-select\"></select>" +
    //         "                   </div>" +
    //         "                   <label id=\"selector-label\"></label>" +
    //         "               </div>" +
    //         "           </div>" +
    //         "       </div>" +
    //         "   </div>" +
    //         "   <div class=\"singleButton\">" +
    //         "       <button id=\"selector-add-button\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + strings.messages.add + "</button>" +
    //         "   </div>" +
    //         "</div>");

    //     let select = document.getElementById("selector-sensor-list");
    //     for (let iSensorDef = 0; iSensorDef < sensorDefinitions.length; iSensorDef++) {
    //         let sensorDefinition = sensorDefinitions[iSensorDef];

    //         if (sensorDefinition.subTypes) {
    //             for (let iSubType = 0; iSubType < sensorDefinition.subTypes.length; iSubType++) {

    //                 if (!sensorDefinition.pluggable && !sensorDefinition.subTypes[iSubType].pluggable)
    //                     continue;


    //                 let el = document.createElement("option");
    //                 el.textContent = sensorDefinition.description;

    //                 if (sensorDefinition.subTypes[iSubType].description)
    //                     el.textContent = sensorDefinition.subTypes[iSubType].description;

    //                 el.value = sensorDefinition.name;
    //                 el.value += "-" + sensorDefinition.subTypes[iSubType].subType;
    //                 select.appendChild(el);
    //             }
    //         } else {
    //             if (!sensorDefinition.pluggable)
    //                 continue;

    //             let el = document.createElement("option");
    //             el.textContent = sensorDefinition.description;
    //             el.value = sensorDefinition.name;

    //             select.appendChild(el);
    //         }
    //     }

    //     let board = mainBoard.getCurrentBoard(context.board);
    //     if (board.builtinSensors) {
    //         for (let i = 0; i < board.builtinSensors.length; i++) {
    //             let sensor = board.builtinSensors[i];
    //             let sensorDefinition = sensorHandler.findSensorDefinition(sensor);

    //             if (context.findSensor(sensor.type, sensor.port, false))
    //                 continue;

    //             let el = document.createElement("option");

    //             el.textContent = sensorDefinition.description + strings.messages.builtin;
    //             el.value = sensorDefinition.name + "-";

    //             if (sensor.subType)
    //                 el.value += sensor.subType;

    //             el.value += "-" + sensor.port;

    //             select.appendChild(el);
    //         }
    //     }

    //     $('#selector-sensor-list').on('change', function () {
    //         let values = this.value.split("-");
    //         let builtinport = false;

    //         let dummysensor = { type: values[0] };

    //         if (values.length >= 2)
    //             if (values[1])
    //                 dummysensor.subType = values[1];

    //         if (values.length >= 3)
    //             builtinport = values[2];

    //         let sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);

    //         let imageContainer = document.getElementById("selector-image-container");
    //         while (imageContainer.firstChild) {
    //             imageContainer.removeChild(imageContainer.firstChild);
    //         }
    //         for (let i = 0; i < sensorDefinition.selectorImages.length; i++) {
    //             let image = document.createElement('img');

    //             image.src = getImg(sensorDefinition.selectorImages[i]);

    //             imageContainer.appendChild(image);

    //             //$('#selector-sensor-image').attr("src", getImg(sensorDefinition.selectorImages[0]));
    //         }


    //         let portSelect = document.getElementById("selector-sensor-port");
    //         $('#selector-sensor-port').empty();
    //         let hasPorts = false;
    //         if (builtinport) {
    //             let option = document.createElement('option');
    //             option.innerText = builtinport;
    //             option.value = builtinport;
    //             portSelect.appendChild(option);
    //             hasPorts = true;
    //         } else {
    //             let ports = mainBoard.getCurrentBoard(context.board).portTypes[sensorDefinition.portType];
    //             if (sensorDefinition.portType == "i2c")
    //             {
    //                 ports = ["i2c"];
    //             }

    //             for (let iPort = 0; iPort < ports.length; iPort++) {
    //                 let port = sensorDefinition.portType + ports[iPort];
    //                 if (sensorDefinition.portType == "i2c")
    //                     port = "i2c";

    //                 if (!isPortUsed(sensorDefinition.name, port)) {
    //                     let option = document.createElement('option');
    //                     option.innerText = port;
    //                     option.value = port;
    //                     portSelect.appendChild(option);
    //                     hasPorts = true;
    //                 }
    //             }
    //         }



    //         if (!hasPorts) {
    //             $('#selector-add-button').attr('disabled', 'disabled');

    //             let object_function = strings.messages.actuator;
    //             if (sensorDefinition.isSensor)
    //                 object_function = strings.messages.sensor;

    //             $('#selector-label').text(strings.messages.noPortsAvailable.format(object_function, sensorDefinition.portType));
    //             $('#selector-label').show();
    //         }
    //         else {
    //             $('#selector-add-button').attr('disabled', null);
    //             $('#selector-label').hide();
    //         }
    //     });

    //     $('#selector-add-button').click(function () {
    //         let sensorType = $("#selector-sensor-list option:selected").val();
    //         let values = sensorType.split("-");

    //         let dummysensor = { type: values[0] };
    //         if (values.length == 2)
    //             dummysensor.subType = values[1];

    //         let sensorDefinition = sensorHandler.findSensorDefinition(dummysensor);


    //         let port = $("#selector-sensor-port option:selected").text();
    //         let name = getNewSensorSuggestedName(sensorDefinition.suggestedName);

    //         // if(name == 'screen1') {
    //             // prepend screen because squareSize func can't handle cells wrap
    //             infos.quickPiSensors.unshift({
    //                 type: sensorDefinition.name,
    //                 subType: sensorDefinition.subType,
    //                 port: port,
    //                 name: name
    //             });

    //         // } else {
    //         //     infos.quickPiSensors.push({
    //         //         type: sensorDefinition.name,
    //         //         subType: sensorDefinition.subType,
    //         //         port: port,
    //         //         name: name
    //         //     });
    //         // }



    //         $('#popupMessage').hide();
    //         window.displayHelper.popupMessageShown = false;

    //         context.resetSensorTable();
    //         context.resetDisplay();
    //     });


    //     $("#selector-sensor-list").trigger("change");

    //     $('#picancel').click(function () {
    //         $('#popupMessage').hide();
    //         window.displayHelper.popupMessageShown = false;
    //     });
    // });
  }

  clickAdder() {
    window.displayHelper.showPopupDialog("<div class=\"content qpi\">" +
      "   <div class=\"panel-heading\">" +
      "       <h2 class=\"sectionTitle\">" +
      "           <span class=\"iconTag\"><i class=\"icon fas fa-list-ul\"></i></span>" +
      this.strings.messages.addcomponent +
      "       </h2>" +
      "       <div class=\"exit\" id=\"picancel\"><i class=\"icon fas fa-times\"></i></div>" +
      "   </div>" +
      "   <div id=\"sensorPicker\" class=\"panel-body\">" +
      "       <label>" + this.strings.messages.selectcomponent + "</label>" +
      "       <div class=\"flex-container\">" +
      "           <div id=\"selector-image-container\" class=\"flex-col half\">" +
      "               <img id=\"selector-sensor-image\">" +
      "           </div>" +
      "           <div class=\"flex-col half\">" +
      "               <div class=\"form-group\">" +
      "                   <div class=\"input-group\">" +
      "                       <select id=\"selector-sensor-list\" class=\"custom-select\"></select>" +
      "                   </div>" +
      "              </div>" +
      "              <div class=\"form-group\">" +
      "                   <div class=\"input-group\">" +
      "                       <select id=\"selector-sensor-port\" class=\"custom-select\"></select>" +
      "                   </div>" +
      "                   <label id=\"selector-label\"></label>" +
      "               </div>" +
      "           </div>" +
      "       </div>" +
      "   </div>" +
      "   <div class=\"singleButton\">" +
      "       <button id=\"selector-add-button\" class=\"btn btn-centered\"><i class=\"icon fa fa-check\"></i>" + this.strings.messages.add + "</button>" +
      "   </div>" +
      "</div>", () => {
      let select = document.getElementById("selector-sensor-list");
      for (let iSensorDef = 0; iSensorDef < this.sensorDefinitions.length; iSensorDef++) {
        let sensorDefinition = this.sensorDefinitions[iSensorDef];
        // console.log("adder",sensorDefinition.name)
        if (sensorDefinition.subTypes) {
          for (let iSubType = 0; iSubType < sensorDefinition.subTypes.length; iSubType++) {

            if (!sensorDefinition.pluggable && !sensorDefinition.subTypes[iSubType].pluggable)
              continue;


            let el = document.createElement("option");
            el.textContent = sensorDefinition.description;

            if (sensorDefinition.subTypes[iSubType].description)
              el.textContent = sensorDefinition.subTypes[iSubType].description;

            el.value = sensorDefinition.name;
            el.value += "-" + sensorDefinition.subTypes[iSubType].subType;
            select.appendChild(el);
            // console.log("+",el.value)
          }
        } else {
          if (!sensorDefinition.pluggable)
            continue;

          let el = document.createElement("option");
          el.textContent = sensorDefinition.description;
          el.value = sensorDefinition.name;
          // console.log("+",el.value)

          select.appendChild(el);
        }
      }

      let board = this.context.mainBoard.getCurrentBoard(this.context.board);
      if (board.builtinSensors) {
        for (let i = 0; i < board.builtinSensors.length; i++) {
          let sensor = board.builtinSensors[i];
          let sensorDefinition = this.sensorHandler.findSensorDefinition(sensor);

          if (this.context.findSensor(sensor.type, sensor.port, false))
            continue;

          let el = document.createElement("option");

          el.textContent = sensorDefinition.description + this.strings.messages.builtin;
          el.value = sensorDefinition.name + "-";

          if (sensor.subType)
            el.value += sensor.subType;

          el.value += "-" + sensor.port;

          select.appendChild(el);
        }
      }

      $('#selector-sensor-list').on('change', () => {
        let values = ($('#selector-sensor-list').val() as string).split("-");
        // console.log(values)
        let builtinport: any = false;

        let dummysensor: any = { type: values[0] };

        if (values.length >= 2)
          if (values[1])
            dummysensor.subType = values[1];

        if (values.length >= 3)
          builtinport = values[2];

        let sensorDefinition = this.sensorHandler.findSensorDefinition(dummysensor);

        let imageContainer = document.getElementById("selector-image-container");
        while (imageContainer.firstChild) {
          imageContainer.removeChild(imageContainer.firstChild);
        }
        for (let i = 0; i < sensorDefinition.selectorImages.length; i++) {
          let image = document.createElement('img');

          image.src = getImg(sensorDefinition.selectorImages[i]);

          imageContainer.appendChild(image);

          //$('#selector-sensor-image').attr("src", getImg(sensorDefinition.selectorImages[0]));
        }


        let portSelect = document.getElementById("selector-sensor-port");
        $('#selector-sensor-port').empty();
        let hasPorts = false;
        if (builtinport) {
          let option = document.createElement('option');
          option.innerText = builtinport;
          option.value = builtinport;
          portSelect.appendChild(option);
          hasPorts = true;
        } else {
          let ports = this.context.mainBoard.getCurrentBoard(this.context.board).portTypes[sensorDefinition.portType];
          // console.log(ports)
          if (sensorDefinition.portType == "i2c")
          {
            ports = ["i2c"];
          }

          for (let iPort = 0; iPort < ports.length; iPort++) {
            let port = sensorDefinition.portType + ports[iPort];
            if (sensorDefinition.portType == "i2c")
              port = "i2c";

            if (!this.sensorHandler.isPortUsed(sensorDefinition.name, port)) {
              let option = document.createElement('option');
              option.innerText = port;
              option.value = port;
              portSelect.appendChild(option);
              hasPorts = true;
            }
          }
        }



        if (!hasPorts) {
          $('#selector-add-button').attr('disabled', 'disabled');

          let object_function = this.strings.messages.actuator;
          if (sensorDefinition.isSensor)
            object_function = this.strings.messages.sensor;

          $('#selector-label').text(this.strings.messages.noPortsAvailable.format(object_function, sensorDefinition.portType));
          $('#selector-label').show();
        }
        else {
          $('#selector-add-button').attr('disabled', null);
          $('#selector-label').hide();
        }
      });

      $('#selector-add-button').click(() => {
        let sensorType = $("#selector-sensor-list option:selected").val() as string;
        let values = sensorType.split("-");

        let dummysensor: any = { type: values[0] };
        if (values.length == 2)
          dummysensor.subType = values[1];

        let sensorDefinition = this.sensorHandler.findSensorDefinition(dummysensor);


        let port = $("#selector-sensor-port option:selected").text();
        let name = this.sensorHandler.getNewSensorSuggestedName(sensorDefinition.suggestedName);

        // if(name == 'screen1') {
        // prepend screen because squareSize func can't handle cells wrap
        this.context.infos.quickPiSensors.unshift({
          type: sensorDefinition.name,
          subType: sensorDefinition.subType,
          port: port,
          name: name
        });

        // } else {
        //     infos.quickPiSensors.push({
        //         type: sensorDefinition.name,
        //         subType: sensorDefinition.subType,
        //         port: port,
        //         name: name
        //     });
        // }



        $('#popupMessage').hide();
        window.displayHelper.popupMessageShown = false;

        this.context.resetSensorTable();
        this.context.resetDisplay();
      });


      $("#selector-sensor-list").trigger("change");

      $('#picancel').click(function () {
        $('#popupMessage').hide();
        window.displayHelper.popupMessageShown = false;
      });
    });
  }

  setSlider(sensor, juststate, imgx, imgy, imgw, imgh, min, max) {
    // console.log("setSlider",juststate)
    if (juststate) {

      if (Array.isArray(sensor.state)) {
        for (let i = 0; i < sensor.state.length; i++) {
          if (sensor.sliders[i] == undefined)
            continue;

          let percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[i], sensor);

          const thumby = sensor.sliders[i].sliderdata.insiderecty +
            sensor.sliders[i].sliderdata.insideheight -
            sensor.sliders[i].sliderdata.thumbheight -
            (percentage * sensor.sliders[i].sliderdata.scale);

          sensor.sliders[i].thumb.attr('y', thumby);
          sensor.sliders[i].slider.toFront();
        }
      } else {
        let percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);

        const thumby = sensor.sliders[0].sliderdata.insiderecty +
          sensor.sliders[0].sliderdata.insideheight -
          sensor.sliders[0].sliderdata.thumbheight -
          (percentage * sensor.sliders[0].sliderdata.scale);

        sensor.sliders[0].thumb.attr('y', thumby);
      }

      return;
    }

    this.removeSlider(sensor);


    sensor.sliders = [];

    let actuallydragged;

    sensor.hasslider = true;
    sensor.focusrect.drag(
      (dx, dy, x, y, event) => {
        if (sensor.sliders.length != 1)
          return;

        let newy = sensor.sliders[0].sliderdata.zero + dy;

        if (newy < sensor.sliders[0].sliderdata.insiderecty)
          newy = sensor.sliders[0].sliderdata.insiderecty;

        if (newy > sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight)
          newy = sensor.sliders[0].sliderdata.insiderecty + sensor.sliders[0].sliderdata.insideheight - sensor.sliders[0].sliderdata.thumbheight;

        sensor.sliders[0].thumb.attr('y', newy);

        let percentage = 1 - ((newy - sensor.sliders[0].sliderdata.insiderecty) / sensor.sliders[0].sliderdata.scale);

        sensor.state = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor, true);

        actuallydragged++;
      },
      function (x, y, event) {
        showSlider();
        actuallydragged = 0;

        if (sensor.sliders.length == 1)
          sensor.sliders[0].sliderdata.zero = sensor.sliders[0].thumb.attr('y');
      },
      function (event) {
        if (actuallydragged > 4) {
          hideSlider(sensor);
        }
      }
    );

    const showSlider = () => {
      hideSlider(sensorWithSlider);
      sensorWithSlider = sensor;

      let w = sensor.drawInfo.width;
      let h = sensor.drawInfo.height;
      let x = sensor.drawInfo.x;
      let y = sensor.drawInfo.y;

      if (Array.isArray(sensor.state)) {

        let offset = 0;
        let sign = -1;
        if (sensor.drawInfo.x -
          ((sensor.state.length - 1) * sensor.drawInfo.width / 5) < 0)
        {
          sign = 1;
          offset = sensor.drawInfo.width * .70;
        }

        // if offset is equal to 0, we need to reverse
        if (offset == 0) {
          for (let i = 0; i < sensor.state.length; i++) {
            let sliderobj = this.createSlider(sensor,
              max,
              min,
              sensor.drawInfo.x + offset + (sign * Math.abs(i + 1 - sensor.state.length) * h / 5),
              sensor.drawInfo.y,
              h,
              h,
              i);

            sensor.sliders.push(sliderobj);
          }
        }
        else {
          for (let i = 0; i < sensor.state.length; i++) {
            let sliderobj = this.createSlider(sensor,
              max,
              min,
              sensor.drawInfo.x + offset + (sign * i * h / 5),
              sensor.drawInfo.y,
              h,
              h,
              i);

            sensor.sliders.push(sliderobj);
          }
        }
      } else {
        let sliderobj = this.createSlider(sensor,
          max,
          min,
          sensor.drawInfo.x,
          sensor.drawInfo.y,
          h,
          h,
          0);
        sensor.sliders.push(sliderobj);
      }
    }
  }

  removeSlider(sensor) {
    if (sensor.hasslider && sensor.focusrect) {
      sensor.focusrect.undrag();
      sensor.hasslider = false;
    }

    if (sensor.sliders) {

      for (let i = 0; i < sensor.sliders.length; i++) {
        sensor.sliders[i].slider.remove();
      }

      sensor.sliders = [];
    }
  }

  createSlider(sensor, max, min, x, y, w, h, index) {
    // console.log("this.createSlider(")
    let sliderobj: any = {};
    sliderobj.sliderdata = {};

    sliderobj.index = index;
    sliderobj.min = min;
    sliderobj.max = max;

    let outsiderectx = x;
    let outsiderecty = y;
    let outsidewidth = w / 6;
    let outsideheight = h;

    let insidewidth = outsidewidth / 6;
    sliderobj.sliderdata.insideheight = h * 0.60;

    let insiderectx = outsiderectx + (outsidewidth / 2) - (insidewidth / 2);
    sliderobj.sliderdata.insiderecty = outsiderecty + (outsideheight / 2) - (sliderobj.sliderdata.insideheight / 2);

    let circleradius = (outsidewidth / 2) - 1;

    let pluscirclex = outsiderectx + (outsidewidth / 2);
    let pluscircley = outsiderecty + circleradius + 1;

    let minuscirclex = pluscirclex;
    let minuscircley = outsiderecty + outsideheight - circleradius - 1;

    this.context.paper.setStart();

    sliderobj.sliderrect = this.context.paper.rect(outsiderectx, outsiderecty, outsidewidth, outsideheight, outsidewidth / 2);
    sliderobj.sliderrect.attr("fill", "#468DDF");
    sliderobj.sliderrect.attr("stroke", "#468DDF");

    sliderobj.sliderrect = this.context.paper.rect(insiderectx, sliderobj.sliderdata.insiderecty, insidewidth, sliderobj.sliderdata.insideheight, 2);
    sliderobj.sliderrect.attr("fill", "#2E5D94");
    sliderobj.sliderrect.attr("stroke", "#2E5D94");


    sliderobj.plusset = this.context.paper.set();

    sliderobj.pluscircle = this.context.paper.circle(pluscirclex, pluscircley, circleradius);
    sliderobj.pluscircle.attr("fill", "#F5A621");
    sliderobj.pluscircle.attr("stroke", "#F5A621");

    sliderobj.plus = this.context.paper.text(pluscirclex, pluscircley, "+");
    sliderobj.plus.attr({ fill: "white" });
    sliderobj.plus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

    sliderobj.plusset.push(sliderobj.pluscircle, sliderobj.plus);

    sliderobj.plusset.click(() => {
      let step = 1;
      let sensorDef = this.sensorHandler.findSensorDefinition(sensor);
      if (sensorDef.step)
        step = sensorDef.step;

      if (Array.isArray(sensor.state)) {
        if (sensor.state[sliderobj.index] < sliderobj.max)
          sensor.state[sliderobj.index] += step;
      }
      else
      {
        if (sensor.state < sliderobj.max)
          sensor.state += step;
      }

      this.sensorHandler.warnClientSensorStateChanged(sensor);
      this.drawSensor(sensor, true);
    });


    sliderobj.minusset = this.context.paper.set();

    sliderobj.minuscircle = this.context.paper.circle(minuscirclex, minuscircley, circleradius);
    sliderobj.minuscircle.attr("fill", "#F5A621");
    sliderobj.minuscircle.attr("stroke", "#F5A621");

    sliderobj.minus = this.context.paper.text(minuscirclex, minuscircley, "-");
    sliderobj.minus.attr({ fill: "white" });
    sliderobj.minus.node.style = "-moz-user-select: none; -webkit-user-select: none;";

    sliderobj.minusset.push(sliderobj.minuscircle, sliderobj.minus);

    sliderobj.minusset.click(() => {
      let step = 1;
      let sensorDef = this.sensorHandler.findSensorDefinition(sensor);
      if (sensorDef.step)
        step = sensorDef.step;

      if (Array.isArray(sensor.state)) {
        if (sensor.state[sliderobj.index] > sliderobj.min)
          sensor.state[sliderobj.index] -= step;
      } else {
        if (sensor.state > sliderobj.min)
          sensor.state -= step;
      }

      this.sensorHandler.warnClientSensorStateChanged(sensor);
      this.drawSensor(sensor, true);
    });


    let thumbwidth = outsidewidth * .80;
    sliderobj.sliderdata.thumbheight = outsidewidth * 1.4;
    sliderobj.sliderdata.scale = (sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight);


    let percentage;
    if (Array.isArray(sensor.state)) {
      percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state[index], sensor);
    } else {
      percentage = this.sensorHandler.findSensorDefinition(sensor).getPercentageFromState(sensor.state, sensor);
    }


    let thumby = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight - (percentage * sliderobj.sliderdata.scale);

    let thumbx = insiderectx + (insidewidth / 2) - (thumbwidth / 2);

    sliderobj.thumb = this.context.paper.rect(thumbx, thumby, thumbwidth, sliderobj.sliderdata.thumbheight, outsidewidth / 2);
    sliderobj.thumb.attr("fill", "#F5A621");
    sliderobj.thumb.attr("stroke", "#F5A621");

    sliderobj.slider = this.context.paper.setFinish();

    sliderobj.thumb.drag(
      (dx, dy, x, y, event) => {

        let newy = sliderobj.sliderdata.zero + dy;

        if (newy < sliderobj.sliderdata.insiderecty)
          newy = sliderobj.sliderdata.insiderecty;

        if (newy > sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight)
          newy = sliderobj.sliderdata.insiderecty + sliderobj.sliderdata.insideheight - sliderobj.sliderdata.thumbheight;

        sliderobj.thumb.attr('y', newy);

        let percentage = 1 - ((newy - sliderobj.sliderdata.insiderecty) / sliderobj.sliderdata.scale);

        if (Array.isArray(sensor.state)) {
          sensor.state[sliderobj.index] = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        } else {
          sensor.state = this.sensorHandler.findSensorDefinition(sensor).getStateFromPercentage(percentage);
        }
        this.sensorHandler.warnClientSensorStateChanged(sensor);
        this.drawSensor(sensor, true);
      },
      function (x, y, event) {
        sliderobj.sliderdata.zero = sliderobj.thumb.attr('y');

      },
      function (event) {
      }
    );

    sliderobj.slider.toFront();

    return sliderobj;
  }
}

let sensorWithSlider = null;
let removeRect = null;
let sensorWithRemoveRect = null;

window.addEventListener('click', function (e: any) {
  let keep = false;
  let keepremove = false;
  e = e || window.event;
  let target = e.target || e.srcElement;

  if (sensorWithRemoveRect && sensorWithRemoveRect.focusrect && target == sensorWithRemoveRect.focusrect.node)
    keepremove = true;

  if (removeRect && !keepremove) {
    removeRect.remove();
    removeRect = null;
  }

  if (sensorWithSlider && sensorWithSlider.focusrect && target == sensorWithSlider.focusrect.node)
    keep = true;

  if (sensorWithSlider && sensorWithSlider.sliders) {
    for (let i = 0; i < sensorWithSlider.sliders.length; i++) {
      sensorWithSlider.sliders[i].slider.forEach(function (element) {
        if (target == element.node ||
          target.parentNode == element.node) {
          keep = true;
          return false;
        }
      });
    }
  }

  if (!keep) {
    hideSlider(sensorWithSlider);
  }

}, false);//<-- we'll get to the false in a minute

function hideSlider(sensor) {
  if (!sensor)
    return;

  if (sensor.sliders) {
    for (let i = 0; i < sensor.sliders.length; i++) {
      sensor.sliders[i].slider.remove();
    }
    sensor.sliders = [];
  }


  if (sensor.focusrect && sensor.focusrect.paper && sensor.focusrect.paper.canvas){
    sensor.focusrect.toFront();
    if(sensor.muteBtn)
      sensor.muteBtn.toFront();
  }
}
